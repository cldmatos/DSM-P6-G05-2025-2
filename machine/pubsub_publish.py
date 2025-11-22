from google.cloud import pubsub_v1
import json
from dotenv import load_dotenv

load_dotenv()

# IDs corretos
project_id = "boreal-conquest-477422-p5"
topic_id = "games"

publisher = pubsub_v1.PublisherClient()
topic_path = publisher.topic_path(project_id, topic_id)

def publish_evaluation(user_id, game_id, evaluation):
    """
    Publica uma avaliação (positiva ou negativa) no Pub/Sub.

    Args:
        user_id (int): ID do usuário.
        game_id (int): ID do jogo.
        evaluation (str): 'positive' ou 'negative'.
    """
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

# Exemplo de uso:
#publish_evaluation(1, 1, "positive")
#publish_evaluation(1, 1, "negative")