import common from '@/../server/common'
import Login from './page/Login.vue'
import NoFind from './page/NoFind.vue'
import Home from './page/Home.vue'
import ArticleList from './page/Article/list.vue'
import ArticleSort from './page/Article/sort.vue'
import ArticleAdd from './page/Article/add.vue'
import UpFileList from './page/UpFile/list.vue'
import userList from './page/User/list.vue'
import userAdd from './page/User/add.vue'
import RosterList from './page/Roster/list.vue'
import RosterData from './page/Roster/datalist.vue'
import addRoster from './page/Roster/addRoster.vue'
import addMember from './page/Roster/addMember.vue'
import LogsList from './page/Logs/list.vue'
export default {
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '*',
      name: '/404',
      component: NoFind
    }, {
      path: '/',
      redirect: '/login'
    }, {
      path: '/login',
      name: 'login',
      meta: { title: '登录' },
      component: Login
    }, {
      path: '/article',
      meta: {
        verify: true,
        title: '文章管理',
        icon: 'fa fa-file-text-o'
      },
      component: Home,
      redirect: '/article/list',
      children: [{
        path: 'sort',
        meta: {
          verify: true,
          grade: common.page_grade.listSort,
          title: '分类管理',
          icon: 'fa fa-th-large'
        },
        component: ArticleSort
      }, {
        path: 'list',
        meta: {
          verify: true,
          grade: common.page_grade.listArticle,
          title: '文章列表',
          icon: 'fa fa-newspaper-o'
        },
        component: ArticleList
      }, {
        path: 'add',
        meta: {
          verify: true,
          title: '添加文章',
          icon: 'fa fa-clone'
        },
        component: ArticleAdd
      }, {
        path: 'edit/:id',
        meta: {
          verify: true,
          title: '编辑文章',
          icon: 'fa fa-clone'
        },
        component: ArticleAdd
      }]
    }, {
		  path: '/roster',
		  meta: {
		    verify: true,
		    title: '名册管理',
		    icon: 'fa fa-file-text-o'
		  },
		  component: Home,
		  redirect: '/roster/list',
		  children: [{
		    path: 'addroster',
		    meta: {
		      verify: true,
		      grade: common.page_grade.updateRoster,
		      title: '新增名册',
		      icon: 'fa fa-th-large'
		    },
		    component: addRoster
		  }, {
		    path: 'list',
		    meta: {
		      verify: true,
		      grade: common.page_grade.listRoster,
		      title: '名册列表',
		      icon: 'fa fa-newspaper-o'
		    },
		    component: RosterList
		  }, {
		    path: 'add',
		    meta: {
		      verify: true,
		      title: '添加会员',
		      icon: 'fa fa-clone'
		    },
		    component: addMember
		  }, {
		    path: 'datalist/:id',
		    meta: {
		      verify: true,
		      title: '会员列表',
		      icon: 'fa fa-clone'
		    },
		    component: RosterData
		  }]
    }, {
      path: '/user',
      meta: {
        verify: true,
        title: '用户管理',
        icon: 'fa fa-user-o'
      },
      redirect: '/user/list',
      component: Home,
      children: [{
        path: 'list',
        meta: {
          verify: true,
          grade: common.page_grade.userList,
          title: '用户列表',
          icon: 'fa fa-address-card-o'
        },
        component: userList
      }, {
        path: 'add',
        meta: {
          verify: true,
          grade: common.page_grade.updateUser,
          title: '添加用户',
          icon: 'fa fa-user-plus'
        },
        component: userAdd
      }, {
        path: 'edit/:id',
        meta: {
          verify: true,
          title: '编辑用户',
          icon: 'fa fa-user-times'
        },
        component: userAdd
      }]
    }, {
      path: '/upfile',
      meta: {
        verify: true,
        title: '上传管理',
        icon: 'fa fa-upload'
      },
      component: Home,
      redirect: '/upfile/list',
      children: [{
        path: 'list',
        meta: {
          verify: true,
          grade: common.page_grade.listUpFile,
          title: '上传列表',
          icon: 'fa fa-files-o'
        },
        component: UpFileList
      }]
    }, {
		  path: '/logs',
		  meta: {
		    verify: true,
		    title: '日志列表',
		    icon: 'fa fa-upload'
		  },
		  component: Home,
		  redirect: '/logs/list',
		  children: [{
		    path: 'list',
		    meta: {
		      verify: true,
		      grade: common.page_grade.listUpFile,
		      title: '日志列表',
		      icon: 'fa fa-files-o'
		    },
		    component: LogsList
      }]
    }
  ]
}
