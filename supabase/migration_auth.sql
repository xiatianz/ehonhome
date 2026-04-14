-- ============================================================
-- Supabase 数据库迁移：从 device_id 切换到 user_id (Auth)
-- ============================================================
-- 
-- 执行步骤：
-- 1. 在 Supabase Dashboard → SQL Editor 中执行此脚本
-- 2. 确保已在 Supabase Dashboard → Authentication 中启用 Email 登录
-- 3. 确保已开启 "Allow new users to sign up"
-- 4. 建议关闭 "Confirm email"（可选，方便用户快速注册）
--    或保持开启以要求邮箱验证
-- ============================================================

-- 1. 删除旧的 sync_data 表（如果存在）
DROP TABLE IF EXISTS sync_data;

-- 2. 创建新的 sync_data 表，使用 user_id 关联 auth.users
CREATE TABLE sync_data (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- 每个 user_id 只能有一条记录
  CONSTRAINT unique_user_id UNIQUE (user_id)
);

-- 3. 启用 Row Level Security (RLS)
ALTER TABLE sync_data ENABLE ROW LEVEL SECURITY;

-- 4. RLS 策略：用户只能访问自己的数据
-- 4.1 用户可以查看自己的数据
CREATE POLICY "Users can view own data"
  ON sync_data
  FOR SELECT
  USING (auth.uid() = user_id);

-- 4.2 用户可以插入自己的数据
CREATE POLICY "Users can insert own data"
  ON sync_data
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4.3 用户可以更新自己的数据
CREATE POLICY "Users can update own data"
  ON sync_data
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4.4 用户可以删除自己的数据
CREATE POLICY "Users can delete own data"
  ON sync_data
  FOR DELETE
  USING (auth.uid() = user_id);

-- 5. 创建 updated_at 自动更新触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON sync_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. 创建索引加速查询
CREATE INDEX idx_sync_data_user_id ON sync_data(user_id);
CREATE INDEX idx_sync_data_updated_at ON sync_data(updated_at DESC);

-- ============================================================
-- 完成！
-- 
-- 验证：
-- SELECT * FROM sync_data;  -- 应该返回空表
-- 
-- 测试 RLS：
-- 1. 注册一个用户
-- 2. 登录后尝试 INSERT/SELECT/UPDATE/DELETE
-- 3. 确认只能操作自己的数据
-- ============================================================
