<script>
import { RouterLink } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
    components: {
        RouterLink,
    },
    data: () => ({
        activeIndex: '1',
        event: {
            eventname: '',
            candidates: {},
            voters: {},
            minselect: 0,
            maxselect: 1,
            yitourenshu: 0,
            ordered: [],
        },
        myVoter: null,
        myVote: [],
        step: 0,
        d: false,
    }),
    methods: {
        handleSelect(key, keyPath) {
            console.log(key, keyPath)
        },
        updateResult() {
            fetch("/api/" + this.event.eventname).then(res => res.json()).then(data => {
                this.event.candidates = data.candidates;
                this.event.voters = data.voters;
                this.event.minselect = data.minselect;
                this.event.maxselect = data.maxselect;
                this.event.yitourenshu = Object.values(data.voters).reduce((a, b) => a + b);
                this.event.ordered = Object.entries(data.candidates).sort((a, b) => b[1] - a[1]).map(x => {
                    return {
                        name: x[0],
                        num: x[1]
                    }
                });
            })
        },
        toggleVote(p) {
            if (this.myVote.includes(p)) {
                this.myVote.splice(this.myVote.indexOf(p), 1);
            } else {
                if (this.myVote.length >= this.event.maxselect) {
                    ElMessage.error("最多只能投" + this.event.maxselect + "人。");
                } else {
                    this.myVote.push(p);
                }
            }
            this.d = true;
            setTimeout(() => { this.d = false; }, 1);
        },
        submit() {
            if (this.myVote.length < this.event.minselect) {
                ElMessage.error("最少投" + this.event.minselect + "人。");
                return;
            }
            ElMessageBox.confirm(
                '你确定要投票吗？',
                '提示',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                }
            )
                .then(() => {
                    fetch("/api/" + this.event.eventname, {
                        method: "POST",
                        body: JSON.stringify({ voter: this.myVoter, votes: this.myVote }),
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }).then(res => res.json()).then(data => {
                        if (data.result == 200) {
                            ElMessage.success("投票成功。");
                            this.step = 2;
                            this.updateResult();
                            setInterval(() => {
                                this.updateResult();
                            }, 5000);
                        } else {
                            ElMessage.error(data.message);
                        }
                    })
                })
        }
    },
    mounted() {
        this.event.eventname = this.$route.params.vote;
        this.updateResult();
        if (this.$route.query.result == "1022") {
            this.step = 2;
            setInterval(() => {
                this.updateResult();
            }, 5000);
        }
    },

}
</script>

<template>
    <header>

        <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" :ellipsis="false"
            @select="handleSelect">
            <el-menu-item index="1">
                <span style="font-size: large;">不记名投票-{{ event.eventname }}</span>
            </el-menu-item>
        </el-menu>

    </header>
    <el-main>
        <el-steps :space="200" :active="step" finish-status="success" align-center>
            <el-step title="登录" />
            <el-step title="投票" />
            <el-step title="查看结果" />
        </el-steps>
        <div style="margin: 16px;" v-if="step == 0">
            <el-text tag="p">
                请选择<span style="font-weight: bold;color: red;">你自己</span>的名字。
            </el-text>
            <el-row gutter="8" style="margin-top: 16px;">
                <el-col :span="8" v-for="item of Object.entries(event.voters)">
                    <el-button :type="item[1] ? 'info' : 'primary'" :disabled="item[1]" plain
                        style="width: 100%; margin-bottom: 8px;" size="large" @click="myVoter = item[0]; step = 1;">{{
                            item[0] }}</el-button>
                </el-col>
            </el-row>
        </div>
        <div style="margin: 16px;" v-else-if="step == 1">
            <el-text tag="p" size="large">
                {{ myVoter }}正在投票。<el-button @click="step = 0" icon="Back">重选</el-button>
            </el-text>
            <el-text tag="p">
                最多投<span style="font-weight: bold;color: red;">{{ event.maxselect }}</span>人，最少投<span
                    style="font-weight: bold;color: red;">{{ event.minselect }}</span>人。选好后请按钮提交。
            </el-text>
            <el-row gutter="8" style="margin-top: 16px;">
                <el-col :span="8" v-for="item of Object.entries(event.candidates)">
                    <el-button :type="myVote.includes(item[0]) ? 'primary' : 'info'" plain
                        style="width: 100%; margin-bottom: 8px;" :disabled="d" size="large"
                        @click="toggleVote(item[0])">{{ item[0]
                        }}</el-button>
                </el-col>
            </el-row>
            <el-text tag="p" v-if="myVote.length > 0">
                你当前选择的是：<span style="font-weight: bold; color:blue" v-for="item in myVote">{{ item }}
                    &nbsp;</span>。确认后请按钮提交。
            </el-text>
            <el-text tag="p" v-else>
                你当前选择的是：<span style="font-weight: bold; color:red">弃权</span>。确认后请按钮提交。
            </el-text>
            <el-row gutter="8" style="margin-top: 16px;">
                <el-col :span="24">
                    <el-button style="width: 100%; margin-bottom: 8px;" size="large" type="primary"
                        @click="submit()">确认投票 </el-button>
                </el-col>
            </el-row>
        </div>
        <div style="margin: 16px;" v-if="step == 2">
            <el-text tag="p">
                投票情况：<span style="font-weight: bold;color: red;">{{ event.yitourenshu }}/{{
                    Object.keys(event.voters).length }}</span>已投票。
            </el-text>
            <el-text tag="p">
                投票人：
            </el-text>
            <el-row gutter="8" style="margin-top: 16px;">
                <el-col :span="8" v-for="item of Object.entries(event.voters)">
                    <el-tag :type="item[1] ? 'info' : 'primary'" style="width: 100%; height:40px; margin-bottom: 8px;"
                        size="large">{{
                            item[0] }}</el-tag>
                </el-col>
            </el-row>
            <el-text tag="p">
                候选人：
            </el-text>
            <el-row gutter="8" style="margin-top: 16px;">
                <el-col :span="24" v-for="item of event.ordered">
                    <el-tag type="primary" style="width: 100%; height:40px; margin-bottom: 8px;"
                        size="large">{{ item.name }} <span style="font-weight: bold;color: red;">{{ item.num
                            }}/{{ event.yitourenshu }}</span></el-tag>
                </el-col>
            </el-row>
        </div>
    </el-main>
</template>

<style scoped></style>
