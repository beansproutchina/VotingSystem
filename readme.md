# 不记名投票系统

## 安装并运行
```bash
git clone https://github.com/beansproutchina/VotingSystem.git
npm install
npm run start
```
现在你可在http://localhost:3225 看到投票页面。
去http://localhost:3225/template 查看投票示例页面。

## 配置投票
1. 在`events/`中新建文件夹，文件夹名将成为后面的投票url名、投票名。
2. 仿照`events/template/`新建配置文件。`candidates.txt`每行一个参选者名，`voters.txt`每行一个投票者名。`data.json`内容为：
    ```json
    {
    "minselect": 0 ,
    "maxselect": 3
    }
    ```
3. 访问http://localhost:3225/api/restartmefuckyou 重启程序，便于加载刚才配置好的新投票。
4. 访问http://localhost:3225/{投票名} 查看投票页面。

## 投票数据
投票数据保存在`events/{投票名}/result.json`中。
此外你还可以去http://localhost:3225/{投票名}?result=1022 查看投票结果。

## 贡献本项目
欢迎提交issue、pr！
