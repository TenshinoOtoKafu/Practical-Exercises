import time

"""
Todo ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*   基礎打印
"""
print("Hello, World")
print(10 > 5)

"""
Todo ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*   變數的打印
"""
a = "Hello, World"
print(a)

print(a[0]) # 打印特定所以字元, 字串是字元陣列
for s in a: # 使用變歷打印
    print(s, end="")
    
print("\n都是字串可使用: " + a) # 不同類型會出錯

"""
Todo ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*   多變數打印
"""
a = "Hello"
b = ", "
c = "World"
print(a, b, c)
print(f"{a}{b}{c}")

a = "字串"
b = 1

print("不同類型同時打印 : " + a, b)

"""
Todo ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*   格式化字串打印
*   f"" 與 .format() 相同, f"" 方便使用, 但某些時候無法使用
*   就可以使用 format 或是 %s 字串, %d 數字, %.2f 取到小數後兩位的符點數... 
"""
a = "字串"  
print("測試{}".format(a))
print(f"測試{a}")
print("測試%s" %(a))

"""
Todo ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*   結尾不換行, 改成空格 (預設會換行)
"""
for _ in range(3):
    print("不換行", end=" ")

# 換行---
print("\n")

"""
Todo ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
*   使用流方式打印 (不經過緩存)
*   \r = 重頭打印[回車] (會覆蓋原有的)

?   補充:
*   r"\" = r 可以避免轉譯反斜摃\ (通常於正則表達式使用)
*   \\ 打兩個 也能避免被轉譯
"""
for i in range(11):
    print(f"\r流打印 [{i}]", end=" ", flush=True)
    time.sleep(0.1)