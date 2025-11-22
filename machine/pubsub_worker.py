import os
import json
import warnings
import mysql.connector
from concurrent.futures import TimeoutError
from dotenv import load_dotenv
from google.cloud import pubsub_v1

# Suprimir FutureWarnings do PubSub
warnings.filterwarnings("ignore", category=FutureWarning)

# Carrega variáveis do .env
load_dotenv()

# Configurações via .env
PROJECT_ID = os.getenv("GCP_PUBSUB_PROJECT_ID")
SUBSCRIPTION_ID = os.getenv("GCP_PUBSUB_SUB_NAME")  # Ex: "games-sub"
CREDENTIALS_PATH = os.getenv("GCP_PUBSUB_KEY_PATH")
TIMEOUT = float(os.getenv("PUBSUB_TIMEOUT", 0))  # 0 = indefinido

if not PROJECT_ID or not SUBSCRIPTION_ID:
    raise RuntimeError("GCP_PUBSUB_PROJECT_ID e GCP_PUBSUB_SUB_NAME devem estar definidos no .env")

if CREDENTIALS_PATH:
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = CREDENTIALS_PATH

# MySQL config
DB_CONFIG = {
    "host": os.getenv("AZURE_MYSQL_HOST"),
    "user": os.getenv("AZURE_MYSQL_USER"),
    "password": os.getenv("AZURE_MYSQL_PASSWORD"),
    "database": os.getenv("AZURE_MYSQL_DATABASE"),
    "port": int(os.getenv("AZURE_MYSQL_PORT", 3306)),
    "autocommit": False
}

def conectar_mysql():
    return mysql.connector.connect(**DB_CONFIG)

def upsert_evaluation_and_update_counts(conn, user_id: int, game_id: int, new_eval: str):
    cursor = conn.cursor()
    if new_eval not in ("positive", "negative"):
        raise ValueError("evaluation deve ser 'positive' ou 'negative'")
    col_map = {"positive": "positive", "negative": "negative"}
    new_col = col_map[new_eval]
    old_col = col_map["negative" if new_eval == "positive" else "positive"]
    cursor.execute(
        "SELECT evaluation FROM game_ratings WHERE user_id = %s AND game_id = %s FOR UPDATE",
        (user_id, game_id)
    )
    row = cursor.fetchone()
    if row is None:
        cursor.execute(
            "INSERT INTO game_ratings (user_id, game_id, evaluation) VALUES (%s, %s, %s)",
            (user_id, game_id, new_eval)
        )
        cursor.execute(
            f"UPDATE games SET `{new_col}` = COALESCE(`{new_col}`,0) + 1 WHERE id = %s",
            (game_id,)
        )
        conn.commit()
        cursor.close()
        return "inserted"
    existing_eval = row[0]
    if existing_eval == new_eval:
        conn.commit()
        cursor.close()
        return "no_change"
    cursor.execute(
        "UPDATE game_ratings SET evaluation = %s WHERE user_id = %s AND game_id = %s",
        (new_eval, user_id, game_id)
    )
    cursor.execute(
        f"UPDATE games SET `{old_col}` = GREATEST(COALESCE(`{old_col}`,0) - 1, 0), `{new_col}` = COALESCE(`{new_col}`,0) + 1 WHERE id = %s",
        (game_id,)
    )
    conn.commit()
    cursor.close()
    return "updated"

def process_message_json(payload_json: str):
    try:
        data = json.loads(payload_json)
        user_id = int(data.get("user_id"))
        game_id = int(data.get("game_id"))
        evaluation = data.get("evaluation")
        if evaluation not in ("positive", "negative"):
            raise ValueError("evaluation inválida")
    except Exception as e:
        print(f"[ERROR] payload inválido: {e} -- payload: {payload_json}")
        raise
    conn = None
    try:
        conn = conectar_mysql()
        result = upsert_evaluation_and_update_counts(conn, user_id, game_id, evaluation)
        print(f"[OK] processado: user={user_id}, game={game_id}, eval={evaluation} -> {result}")
    finally:
        if conn:
            conn.close()

def callback(message: pubsub_v1.subscriber.message.Message) -> None:
    payload = message.data.decode("utf-8")
    print(f"[RECEBIDO] {payload}")
    try:
        process_message_json(payload)
        message.ack()
    except Exception as e:
        print(f"[ERRO] ao processar mensagem: {e}")
        message.nack()

if __name__ == "__main__":
    subscriber = pubsub_v1.SubscriberClient()
    subscription_path = subscriber.subscription_path(PROJECT_ID, SUBSCRIPTION_ID)
    streaming_pull_future = subscriber.subscribe(subscription_path, callback=callback)
    print(f"🚀 Worker Pub/Sub iniciado. Ouvindo mensagens em: {subscription_path}\n")
    with subscriber:
        try:
            if TIMEOUT > 0:
                streaming_pull_future.result(timeout=TIMEOUT)
            else:
                streaming_pull_future.result()
        except TimeoutError:
            streaming_pull_future.cancel()
            streaming_pull_future.result()
        except KeyboardInterrupt:
            print("Interrompido pelo usuário.")
            streaming_pull_future.cancel()
            streaming_pull_future.result()