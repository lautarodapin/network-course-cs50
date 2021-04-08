const { createApp } = Vue;
const { createStore } = Vuex;
const { createRouter, createWebHashHistory } = VueRouter;

const store = createStore({
    state(){
        return {

        }
    },
    getters: {

    },
    mutations: {

    },
    actions: {

    },
})

const Home = {
    template:  `
    <div>
        Home {{t}}
    </div>
`,
    data() {
        return {
            t: "ASDSA",
        }
    }
}
const MainProfile = { 
    template: 
    `
    <div>Profile</div>
    ` 
}
const Profile = { 
    template: 
    `
    <div>Profile {{id}}</div>
    `,
    computed: {
        id(){ return this.$route.params.id},
    }

}

const Login = {
    template: `
        <div>
            Login
        </div>
    `,
}

const Logout = {
    template: `
    <div>Logout</div>
    `,
}

const NotFound = { 
    template: 
    `
    <div>NOT A VALID PATH</div>
    ` 
}


const app = createApp({
    delimiters: ["[[", "]]"],
})

const routes = [
    { path: '/', name: "Home",component: Home },
    { path: '/profile', name: "MainProfile", component: MainProfile },
    { path: '/profile/:id', name: "Profile", component: Profile },
    { path: '/login', name: "Login", component: Login },
    { path: '/logout', name: "Logout", component: Logout },
    { path: '/:pathMatch(.*)', component: NotFound },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes, // short for `routes: routes`
})


app.use(store)
app.use(router);