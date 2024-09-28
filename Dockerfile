# ベースイメージとしてNode.jsの公式イメージを使用
FROM node:18-alpine

# 作業ディレクトリを作成
WORKDIR /app

# パッケージファイルをコピー
COPY package.json package-lock.json ./

# 依存関係をインストール
RUN npm install

# プロジェクト全体をコピー
COPY . .

# ポートを公開（Remixデフォルトは3000）
EXPOSE 5173

# 開発環境ではホットリロードを有効にするためにdevコマンドを使用
CMD ["npm", "run", "dev"]
