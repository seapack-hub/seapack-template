-- ============================================================
-- 场景初始数据（ai_scene）
-- ============================================================

INSERT INTO `ai_scene` (`name`, `code`, `icon`, `cover_color`, `description`, `is_public`, `status`, `sort_order`) VALUES
('AI 智能写作',   'ai_writing',        'EditPen',      '#667eea', '辅助博客文章创作，支持续写、润色、扩写、缩写、风格改写', 1, 1, 1),
('AI 标题生成',   'ai_title_gen',      'MagicStick',   '#11998e', '根据文章内容自动生成标题和摘要',                         1, 1, 2),
('AI 项目描述',   'ai_project_desc',   'Document',     '#f5576c', '根据项目信息自动生成项目描述',                           1, 1, 3),
('AI 个股诊断',   'ai_stock_diagnosis','TrendCharts',  '#ef4444', '整合行情、分红、K线等数据，生成个股分析报告',             1, 1, 4),
('AI 智能客服',   'ai_chatbot',        'ChatDotRound', '#7c3aed', '基于知识库的智能问答，支持多轮对话',                     1, 1, 5),
('AI 技能助手',   'ai_skill_helper',   'Cpu',          '#3b82f6', '辅助编写和调试 AI 技能的提示词模板',                     1, 1, 6);

-- ============================================================
-- 场景部署数据（ai_scene_deployment）
-- 每个场景部署到对应的模块位置
-- ============================================================

-- 场景 1：AI 智能写作 → 博客编辑器工具栏
INSERT INTO `ai_scene_deployment` (`scene_id`, `module_key`, `position_key`, `config`, `is_default`, `sort_order`, `status`) VALUES
(1, 'blogsManagement', 'editor-toolbar', '{"button_text":"AI 写作","icon":"EditPen","tooltip":"AI 辅助写作、续写、润色"}', 1, 0, 1);

-- 场景 2：AI 标题生成 → 博客设置抽屉
INSERT INTO `ai_scene_deployment` (`scene_id`, `module_key`, `position_key`, `config`, `is_default`, `sort_order`, `status`) VALUES
(2, 'blogsManagement', 'settings-drawer', '{"button_text":"AI 生成标题","icon":"MagicStick","tooltip":"自动生成标题和摘要"}', 1, 0, 1);

-- 场景 3：AI 项目描述 → 博客项目编辑器
INSERT INTO `ai_scene_deployment` (`scene_id`, `module_key`, `position_key`, `config`, `is_default`, `sort_order`, `status`) VALUES
(3, 'blogsManagement', 'project-editor', '{"button_text":"AI 生成描述","icon":"Document","tooltip":"自动生成项目描述"}', 1, 0, 1);

-- 场景 4：AI 个股诊断 → 股票详情工具栏
INSERT INTO `ai_scene_deployment` (`scene_id`, `module_key`, `position_key`, `config`, `is_default`, `sort_order`, `status`) VALUES
(4, 'stockFund', 'detail-toolbar', '{"button_text":"AI 诊断","icon":"TrendCharts","tooltip":"AI 智能分析个股"}', 1, 0, 1);

-- 场景 5：AI 智能客服 → AI 聊天侧边栏
INSERT INTO `ai_scene_deployment` (`scene_id`, `module_key`, `position_key`, `config`, `is_default`, `sort_order`, `status`) VALUES
(5, 'aiModule', 'chat-sidebar', '{"button_text":"智能客服","icon":"ChatDotRound","tooltip":"基于知识库的智能问答"}', 1, 0, 1);

-- 场景 6：AI 技能助手 → AI 技能编辑器
INSERT INTO `ai_scene_deployment` (`scene_id`, `module_key`, `position_key`, `config`, `is_default`, `sort_order`, `status`) VALUES
(6, 'aiModule', 'skill-editor', '{"button_text":"AI 助手","icon":"Cpu","tooltip":"辅助编写提示词模板"}', 1, 0, 1);
