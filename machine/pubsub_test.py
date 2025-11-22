import os
import json
import warnings
from concurrent.futures import TimeoutError
from dotenv import load_dotenv
from google.cloud import pubsub_v1
import time

# Suprimir FutureWarnings do PubSub
warnings.filterwarnings("ignore", category=FutureWarning)

# Carrega variáveis do .env
load_dotenv()

PROJECT_ID = os.getenv("GCP_PUBSUB_PROJECT_ID", "boreal-conquest-477422-p5")
TOPIC_ID = os.getenv("GCP_PUBSUB_TOPIC_ID", "games")
SUBSCRIPTION_ID = os.getenv("GCP_PUBSUB_SUB_NAME", "games-sub")
CREDENTIALS_PATH = os.getenv("GCP_PUBSUB_KEY_PATH")
TIMEOUT = float(os.getenv("PUBSUB_TIMEOUT", 10))  # Tempo em segundos para escutar mensagens

if not PROJECT_ID or not TOPIC_ID or not SUBSCRIPTION_ID:
    raise RuntimeError("GCP_PUBSUB_PROJECT_ID, GCP_PUBSUB_TOPIC_ID e GCP_PUBSUB_SUB_NAME devem estar definidos no .env")

if CREDENTIALS_PATH:
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = CREDENTIALS_PATH

def publish_evaluation(user_id, game_id, evaluation):
    """Publica uma avaliação no Pub/Sub."""
    publisher = pubsub_v1.PublisherClient()
    topic_path = publisher.topic_path(PROJECT_ID, TOPIC_ID)
    if evaluation not in ("positive", "negative"):
        raise ValueError("evaluation deve ser 'positive' ou 'negative'")
    message_dict = {
        "user_id": int(user_id),
        "game_id": int(game_id),
        "evaluation": evaluation
    }
    data = json.dumps(message_dict).encode("utf-8")
    try:
        future = publisher.publish(topic_path, data)
        message_id = future.result()
        print(f"Mensagem publicada com ID: {message_id}")
        return message_id
    except Exception as e:
        print(f"Erro ao publicar mensagem: {e}")
        return None

def publish_interactive():
    """Prompt para publicar várias mensagens."""
    print("=== Publicador Pub/Sub ===")
    while True:
        try:
            user_id = input("User ID (ou ENTER para sair): ").strip()
            if not user_id:
                break
            game_id = input("Game ID: ").strip()
            evaluation = input("Evaluation (positive/negative): ").strip().lower()
            publish_evaluation(user_id, game_id, evaluation)
        except Exception as e:
            print(f"Erro: {e}")

def subscriber_callback(message: pubsub_v1.subscriber.message.Message) -> None:
    payload = message.data.decode("utf-8")
    print(f"\n[RECEBIDO] {payload}")
    try:
        print(json.dumps(json.loads(payload), indent=2, ensure_ascii=False))
    except Exception:
        pass
    message.ack()

def run_subscriber(timeout=TIMEOUT):
    """Escuta mensagens do Pub/Sub por um tempo limitado."""
    subscriber = pubsub_v1.SubscriberClient()
    subscription_path = subscriber.subscription_path(PROJECT_ID, SUBSCRIPTION_ID)
    print(f"\n🚀 Ouvindo mensagens em: {subscription_path} (timeout={timeout}s)\n")
    streaming_pull_future = subscriber.subscribe(subscription_path, callback=subscriber_callback)
    with subscriber:
        try:
            streaming_pull_future.result(timeout=timeout)
        except TimeoutError:
            print("\n⏰ Timeout atingido, encerrando assinante.")
            streaming_pull_future.cancel()
            streaming_pull_future.result()
        except KeyboardInterrupt:
            print("\nInterrompido pelo usuário.")
            streaming_pull_future.cancel()
            streaming_pull_future.result()

if __name__ == "__main__":
    # 1. Publica mensagens (interativo ou exemplo fixo)
    print("=== Teste Pub/Sub Unificado ===")
    modo = input("Digite [1] para publicar mensagens interativamente, [2] para exemplo fixo: ").strip()
    if modo == "1":
        publish_interactive()
    else:
        print("Publicando exemplos fixos...")
        publish_evaluation(1, 1, "positive")
        publish_evaluation(2, 2, "negative")
        time.sleep(1)  # Pequeno delay para garantir publicação antes de escutar

    # 2. Inicia o assinante
    print("\n=== Iniciando assinante Pub/Sub ===")
    run_subscriber()
    print("\nFim do teste Pub/Sub.")