-- 스키마 생성
CREATE SCHEMA IF NOT EXISTS alrimjang;

-- NextAuth.js 필수 테이블들 (alrimjang 스키마 안에)
CREATE TABLE IF NOT EXISTS alrimjang.users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  "emailVerified" TIMESTAMPTZ,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alrimjang.accounts (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES alrimjang.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  UNIQUE(provider, "providerAccountId")
);

CREATE TABLE IF NOT EXISTS alrimjang.sessions (
  id TEXT PRIMARY KEY,
  "sessionToken" TEXT UNIQUE NOT NULL,
  "userId" TEXT NOT NULL REFERENCES alrimjang.users(id) ON DELETE CASCADE,
  expires TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS alrimjang.verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- 원아 관리 테이블
CREATE TABLE IF NOT EXISTS alrimjang.children (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES alrimjang.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  birth_date DATE,
  class_name VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 문서 생성 이력 테이블 (통합)
CREATE TABLE IF NOT EXISTS alrimjang.documents (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES alrimjang.users(id) ON DELETE CASCADE,
  child_id INTEGER REFERENCES alrimjang.children(id) ON DELETE CASCADE,
  document_type VARCHAR(20) NOT NULL, -- '알림장', '보육일지', '관찰기록', '발달평가', '부모면담'
  child_name VARCHAR(100) NOT NULL, -- 원아명 (child_id가 없을 경우 직접 입력)
  input_data JSONB NOT NULL, -- 입력 필드 (문서 타입별로 다름)
  generated_content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Templates 테이블 (알림장용 템플릿)
CREATE TABLE IF NOT EXISTS alrimjang.templates (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES alrimjang.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  document_type VARCHAR(20) DEFAULT '알림장',
  child_id INTEGER REFERENCES alrimjang.children(id) ON DELETE SET NULL,
  input_data JSONB NOT NULL,
  generated_content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_email ON alrimjang.users(email);
CREATE INDEX IF NOT EXISTS idx_accounts_userId ON alrimjang.accounts("userId");
CREATE INDEX IF NOT EXISTS idx_sessions_userId ON alrimjang.sessions("userId");
CREATE INDEX IF NOT EXISTS idx_children_user_id ON alrimjang.children(user_id);
CREATE INDEX IF NOT EXISTS idx_children_created_at ON alrimjang.children(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON alrimjang.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_child_id ON alrimjang.documents(child_id);
CREATE INDEX IF NOT EXISTS idx_documents_document_type ON alrimjang.documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON alrimjang.documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON alrimjang.templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_created_at ON alrimjang.templates(created_at DESC);

-- Updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION alrimjang.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Children 테이블 트리거
DROP TRIGGER IF EXISTS update_children_updated_at ON alrimjang.children;
CREATE TRIGGER update_children_updated_at
BEFORE UPDATE ON alrimjang.children
FOR EACH ROW
EXECUTE FUNCTION alrimjang.update_updated_at_column();

-- Templates 테이블 트리거
DROP TRIGGER IF EXISTS update_templates_updated_at ON alrimjang.templates;
CREATE TRIGGER update_templates_updated_at
BEFORE UPDATE ON alrimjang.templates
FOR EACH ROW
EXECUTE FUNCTION alrimjang.update_updated_at_column();
