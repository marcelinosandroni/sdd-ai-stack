#!/bin/bash

# SKILLS/create-feature.sh
# Uso: ./create-feature.sh [client|server] [nome-da-feature]

TARGET=$1
FEATURE_NAME=$2

if [ -z "$TARGET" ] || [ -z "$FEATURE_NAME" ]; then
  echo "❌ Erro: Faltam argumentos."
  echo "Uso: ./create-feature.sh [client|server] [nome-da-feature]"
  exit 1
fi

if [ "$TARGET" == "server" ]; then
  BASE_DIR="server/features/$FEATURE_NAME"
  mkdir -p "$BASE_DIR/domain" "$BASE_DIR/use-cases" "$BASE_DIR/infra"
  
  # Cria arquivos base burros pra IA preencher
  touch "$BASE_DIR/index.ts"
  echo "// Defina as interfaces de domínio aqui" > "$BASE_DIR/domain/I${FEATURE_NAME^}Repository.ts"
  echo "// Implemente a lógica de negócio aqui" > "$BASE_DIR/use-cases/Process${FEATURE_NAME^}UseCase.ts"
  
  echo "✅ Feature backend '$FEATURE_NAME' criada em $BASE_DIR (Vertical Slices)"

elif [ "$TARGET" == "client" ]; then
  BASE_DIR="client/features/$FEATURE_NAME"
  mkdir -p "$BASE_DIR/components" "$BASE_DIR/hooks" "$BASE_DIR/store" "$BASE_DIR/utils"
  
  touch "$BASE_DIR/index.ts"
  echo "// Componente principal da feature" > "$BASE_DIR/components/${FEATURE_NAME^}View.tsx"
  
  echo "✅ Feature frontend '$FEATURE_NAME' criada em $BASE_DIR"

else
  echo "❌ Erro: O target deve ser 'client' ou 'server'."
  exit 1
fi