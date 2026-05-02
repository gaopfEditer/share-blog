-- ==========================================
-- 1. 配置区
-- ==========================================
local SYMBOL = "BINANCE:BTCUSDT" 
local API_URL = "https://your-server.com/api" 
local IMG_PATH = os.getenv("HOME") .. "/Desktop/tradingview_analysis.png"

-- ==========================================
-- 2. 核心函数：Base64 编码执行 JS (避开引号报错)
-- ==========================================
local function executeJS(jsCode)
    local b64 = hs.base64.encode(jsCode)
    local script = string.format([[
        tell application "Google Chrome"
            set theJS to do shell script "echo '%s' | base64 --decode"
            tell active tab of window 1 to execute javascript theJS
        end tell
    ]], b64)
    return hs.osascript.applescript(script)
end

-- 增强版页签激活：根据URL判断（不区分大小写）
local function focusTab(urlPattern)
    -- 转换为小写以便不区分大小写匹配
    local patternLower = string.lower(urlPattern)
    local script = string.format([[
        tell application "Google Chrome"
            repeat with w in windows
                set i to 0
                repeat with t in tabs of w
                    set i to i + 1
                    try
                        set tabUrl to URL of t as string
                        -- 使用 ignoring case 进行不区分大小写匹配
                        ignoring case
                            if tabUrl contains "%s" then
                                set index of w to 1 -- 强制窗口置顶
                                set active tab index of w to i -- 激活页签
                                activate
                                return true
                            end if
                        end ignoring
                    end try
                end repeat
            end repeat
            return false
        end tell
    ]], patternLower)
    local ok, result = hs.osascript.applescript(script)
    return ok and result
end

-- ==========================================
-- 3. 主程序
-- ==========================================
hs.hotkey.bind({"cmd", "alt", "ctrl"}, "X", function()
    hs.alert.show("🚀 启动深度同步流程...")

    -- --- 第一步：聚焦 TradingView（根据URL包含tradingview判断）---
    if not focusTab("tradingview") then
        hs.alert.show("❌ 未找到 TradingView 标签页")
        return
    end

    -- 切换币种（暂时禁用）
    -- local jumpJS = "window.location.href='https://www.tradingview.com/chart/?symbol=" .. SYMBOL .. "';"
    -- executeJS(jumpJS)

    -- --- 第二步：等待 6 秒加载后，在 TV 页面截图 ---
    hs.timer.doAfter(6, function()
        -- 再次强制激活一次，防止中途点到了别的窗口
        focusTab("tradingview")
        hs.timer.usleep(500000)

        local win = hs.window.focusedWindow()
        if win and win:title():find("TradingView") or win:application():name() == "Google Chrome" then
            local f = win:frame()
            -- 截图：只截取 TV 窗口内容
            local snapshot = hs.screen.mainScreen():snapshot({x=f.x, y=f.y+120, w=f.w, h=f.h-180})
            if snapshot then 
                snapshot:saveToFile(IMG_PATH) 
                hs.alert.show("📸 已正确截取图表")
            end
        end

        -- --- 第三步：截图完成后，再跳转到 Gemini ---
        hs.timer.doAfter(1.5, function()
            if not focusTab("gemini.google.com") then
                hs.alert.show("❌ 未找到 Gemini")
                return
            end

            -- --- 第四步：Gemini 内部粘贴和发送流程（刷新后直接操作）---
            hs.timer.doAfter(4, function()
                -- 确保窗口激活
                focusTab("gemini")
                hs.timer.usleep(500000)
                
                -- 刷新页面（让输入框自动聚焦）
                hs.eventtap.keyStroke({"cmd"}, "r")
                hs.alert.show("🔄 正在刷新 Gemini 页面...")
                
                -- 等待2秒让页面加载完成
                hs.timer.doAfter(2, function()
                    -- 1. 直接粘贴图片（刷新后输入框已自动聚焦）
                    local img = hs.image.imageFromPath(IMG_PATH)
                    if img then
                        hs.pasteboard.clearContents()
                        hs.pasteboard.writeObjects(img)
                        hs.timer.usleep(500000)
                        hs.eventtap.keyStroke({"cmd"}, "v")
                        hs.alert.show("📥 图片已粘贴")
                        
                        -- 2. 等待图片上传后，直接输入文本
                        hs.timer.doAfter(4, function()
                            local prompt = "分析此 " .. SYMBOL .. " 截图。给出胜率建议。异动前加【！！MARKET_ALERT！！】。"
                            hs.pasteboard.clearContents()
                            hs.pasteboard.setContents(prompt)
                            hs.timer.usleep(300000)
                            hs.eventtap.keyStroke({"cmd"}, "v")
                            hs.alert.show("📝 文字已输入")
                            
                            -- 3. 直接触发回车发送（延迟2秒）
                            hs.timer.doAfter(2, function()
                                hs.eventtap.keyStroke({}, "return")
                                hs.alert.show("🚀 任务已提交")
                                
                                -- 4. 抓取回复内容
                                hs.timer.doAfter(25, function()
                                    local grabJS = [[
                                        (function() {
                                            // 尝试多种选择器来获取最后一条消息
                                            var selectors = [
                                                '.message-content',
                                                '.markdown',
                                                '[data-message-content]',
                                                '.response-text',
                                                'div[role="article"]:last-child',
                                                '.conversation-turn:last-child'
                                            ];
                                            for (var i = 0; i < selectors.length; i++) {
                                                var elements = document.querySelectorAll(selectors[i]);
                                                if (elements.length > 0) {
                                                    var lastEl = elements[elements.length - 1];
                                                    var text = lastEl.innerText || lastEl.textContent;
                                                    if (text && text.trim().length > 0) {
                                                        return text.trim();
                                                    }
                                                }
                                            }
                                            return 'FAILED';
                                        })();
                                    ]]
                                    local ok, content = executeJS(grabJS)
                                    if ok and content and content ~= "FAILED" and content:len() > 10 then
                                        hs.http.asyncPost(API_URL, hs.json.encode({symbol=SYMBOL, text=content}), {["Content-Type"]="application/json"}, function(status, body, headers)
                                            if status == 200 then
                                                hs.alert.show("✅ 内容已推送到服务器")
                                            else
                                                hs.alert.show("⚠️ 推送失败: " .. tostring(status))
                                            end
                                        end)
                                    else
                                        hs.alert.show("⚠️ 未能抓取到回复内容")
                                    end
                                end)
                            end)
                        end)
                    else
                        hs.alert.show("❌ 图片文件不存在")
                    end
                end)
                end)
            end)
        end)
    end)


hs.alert.show("脚本重载：修复了截图跨页面冲突")