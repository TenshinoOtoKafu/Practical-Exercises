""" 題目說明

請使用迴圈敘述撰寫一程式，讓使用者輸入兩個正整數a、b(a < b)
利用迴圈計算從a開始的偶數連加到b的總和。
例如：輸入a=1、b=100，則輸出結果為2550（2 + 4 + … + 100 = 2550）。

範例輸入
14
1144

範例輸出
327714

"""
sum = 0
a = int(input("整數a:"))
b = int(input("整數b:"))

if a < b:
    for i in range(a,b+1):
        if i % 2 == 0:sum += i
    print(sum)