# project01

全端練習-電商平台
電商平台的實作流程，包含基本的crud功能、資料庫建置、登入驗證、金流串接、第三方API串接
框架：Node.js,Express,EJS，
資料庫：MySQL 搭配mysql2，
RESTful風格，
商品圖片：imgur api，
金流： 綠界api，

# 手機註冊
![註冊](https://github.com/aether123/project01/assets/27948644/fd216578-55b9-4bfb-90fb-fe64d8710805)


1.手機註冊會員，TWILIO套件實作otp

# 登入頁面
![登入](https://github.com/aether123/project01/assets/27948644/69416c8d-839a-4735-baa6-c213649482dc)

1.登入系統：passport-google-oauth20 ,passportlocation ,passportfacebook,passportline

# 首頁
![首頁](https://github.com/aether123/project01/assets/27948644/7165b0ac-74be-4ff4-aba2-da6a4a9b65f5)
1. 點擊阿良購物都會回到首頁
2. 點賣家中心可以選擇新增商品，與已上架的商品狀態
3. 點擊大頭貼可以選擇修改使用者資訊，購物車頁面，登出頁面
4.點擊購物車icon 可以看見詳細的購物清單
5.首頁會顯示賣家上架商品資
6.可以透過搜尋查找商品

# 單一物品頁面
![物品頁面](https://github.com/aether123/project01/assets/27948644/259a2691-aed3-420e-bece-fa43dcfdf27b)

1.點選加入購物車，會跳出題是訊息告知消費者加入成功
2.點選直接購買會跳轉到購物車頁面
3.物品的基本資訊

# 購物車頁面
![購物車](https://github.com/aether123/project01/assets/27948644/f556133e-52c8-4812-9418-a94392f3b461)

1. 可以修改數量，修改數量時資料庫也會一起修改
2. 可以刪除物品清單
3. 可以勾選所有商品或個別商品，被勾選商品才會增加總金額

# 結帳頁面
![結帳](https://github.com/aether123/project01/assets/27948644/33f863b6-d300-4306-910d-57550932b905)


1.貨到付款會將訂單商品記錄到資料庫中，
2.信用卡結帳會連接綠屆api後才記錄到資料庫中
3.會判斷是否是同意商家，不是同一商家只能選貨到付款

# 新增商品頁面
![image](https://github.com/aether123/project01/assets/27948644/d89560ff-accd-4519-a4d3-e93d15e30234)

1.  透過imgur api 實作上傳圖片功能










