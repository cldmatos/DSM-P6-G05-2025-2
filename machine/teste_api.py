# Testar se a API está online
#curl http://13.68.75.61:5000/

# Buscar todos os jogos
#curl http://13.68.75.61:5000/jogos?limite=5

# Buscar jogo por ID
#curl http://13.68.75.61:5000/jogos/1

# Recomendações
#curl http://13.68.75.61:5000/jogos/1/recomendacoes

import requests
import json

def test_api():
    base_url = "http://13.68.75.61:5000"
    
    try:
        # Teste básico
        print("🧪 Testando API...")
        response = requests.get(f"{base_url}/")
        print(f"✅ Home: {response.status_code}")
        print(json.dumps(response.json(), indent=2))
        
        # Teste jogos
        response = requests.get(f"{base_url}/jogos?limite=3")
        print(f"✅ Jogos: {response.status_code}")
        data = response.json()
        print(f"📊 {data['total']} jogos totais")
        
        # Teste jogo aleatório
        response = requests.get(f"{base_url}/jogos/aleatorio")
        jogo = response.json()
        print(f"🎲 Jogo aleatório: {jogo['name']}")
        
        # Teste recomendações (se tiver jogos)
        if data['jogos']:
            jogo_id = data['jogos'][0]['id']
            response = requests.get(f"{base_url}/jogos/{jogo_id}/recomendacoes")
            recs = response.json()
            print(f"🎯 Recomendações: {len(recs['recomendacoes'])} jogos")
        
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    test_api()