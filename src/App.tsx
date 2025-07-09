@@ .. @@
   // Memoize props for panels
   const botBuilderPanelProps = useMemo(() => ({
     indicators,
@@ .. @@
   const chatPanelProps = useMemo(() => ({
     indicators,
     indicatorStates,
-    setIndicatorStates,
-    setMessages,
-    messages,
+    setIndicatorStates, 
+    setIndicators,
     token
   }), [indicators, indicatorStates, setIndicatorStates, setMessages, messages, token]);