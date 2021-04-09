const { createApp } = Vue;
const { createStore } = Vuex;
const { createRouter, createWebHistory } = VueRouter;
const store = createStore({
    state(){
        return {
            user: {},
            posts:[],
            paginator:{},
        }
    },
    getters: {
        user: (state) => state.user,
        isAuth: (state) => state.user?state.user.is_authenticated:false,
        posts: (state) => state.posts,
        filteredPosts: (state) => (username) => state.posts.filter(post => post.user.username == username)
    },
    mutations: {
        login(state, user){
            console.log(user)
            state.user = user
        },
        logout(state){
            state.user = {}
        },
        setPosts(state, posts){
            state.posts = posts;
        },
        setPaginator(state, paginator){
            state.paginator = paginator;
        },
    },
    actions: {
        login({context, commit}){
            return axios.get("/api/user/")
            .then(response => {
                console.log(response)
                commit("login", response.data.user)
            })
            .catch(error => {console.log(error)})
        },
        logout({context, commit}){
            commit("logout")
        },
        getUser({commit}){
            return axios.get(`/api/user/`)
                .then(response => {
                    console.log(response)
                    commit("login", response.data.user)
                    return response.data.user
                })
                .catch(error=>console.log(error))
        },
        getAllPosts({commit}, pageNumber){
            return axios.get(`/api/posts/?page=${pageNumber}`)
            .then(response => {
                console.log(response)
                commit("setPosts", response.data.posts)
                commit("setPaginator", response.data.paginator)
            })
            .catch(error => console.log(error))
        },
        getAllFilteredPosts({commit}, pageNumber, username){
            return axios.get(`/api/posts/?page=${pageNumber}&username=${username}`)
            .then(response => {
                console.log(response)
                commit("setPosts", response.data.posts)
                commit("setPaginator", response.data.paginator)
            })
            .catch(error => console.log(error))
        }
    },
})

const LikeComponent = {
    template: `
    <button @click="$emit('like', 1)" class="btn btn-success btn-sm ml-2">+1</button>
    <button @click="$emit('like', -1)" class="btn btn-danger btn-sm ml-2">-1</button>
    <button type="button" class="btn btn-primary btn-sm ml-2">
        <span class="badge badge-light">
            {{likes}}
        </span>
    </button>
    `,
    props: ["likes",],
    emits: ["like"],
}
const Avatar = {
    template: `
    <div className="card-header">
        <router-link :to="{name: 'Profile', params:{id: id}}">
            {{username}}
        </router-link>
        <span className="text-muted ml-4">
            <small>
                {{createdAt}}
            </small>
        </span>
        <span v-if="likes != null && isAuth">
            <LikeComponent :likes="likes" @like="$emit('like', $event)" />
        </span>
    </div>
    `,
    components: {LikeComponent,},
    props:["username", "createdAt", "likes", "like", "id"],
    computed: {
        isAuth(){return this.$store.getters.isAuth},
    }
}

const Paginator = {
    template: `
    <nav aria-label="...">
        <ul class="pagination">
            <li class="page-item" :class="paginator.has_previus?'':'disabled'">
                <a @click="$emit('switchPage', 1)" href="#" class="page-link">First</a>
            </li>
            <li class="page-item" :class="paginator.has_previus?'':'disabled'">
                <a @click="$emit('switchPage', currentPage - 1)" href="#" class="page-link" aria-label="Previous">
                    <span aria-hidden="true">&laquo;</span>
                    <span class="sr-only">Previous</span>
                </a>
            </li>
            <li class="page-item" v-for="page in previusPages" v-if="paginator.has_previus" :key="page">
                <a @click="$emit('switchPage', page)" class="page-link" href="#">{{page}}</a>
            </li>
            <li class="page-item active">
                <a class="page-link" href="#">{{currentPage}}<span class="sr-only">(current)</span></a>
            </li>
            <li class="page-item" v-for="page in nextPages" v-if="paginator.has_next" :key="page">
                <a @click="$emit('switchPage', page)" class="page-link" href="#">{{page}}</a>
            </li>
            <li class="page-item" :class="paginator.has_next?'':'disabled'">
                <a @click="$emit('switchPage', currentPage + 1)" class="page-link" href="#" aria-label="Next">
                    <span aria-hidden="true">&raquo;</span>
                    <span class="sr-only">Next</span>
                </a>
            </li>
            <li class="page-item" :class="paginator.has_next?'':'disabled'">
                <a @click="$emit('switchPage', paginator.num_pages)" class="page-link" href="#">Last</a>
            </li>
        </ul>
    </nav>
    `,
    props: ["paginator",],
    emits: ["switchPage"],
    computed:{
        previusPages(){
            var array = Array.from({length: this.paginator.current}, (e, i) => i + 1);
            array.pop(array.length)
            return array
        },
        currentPage(){
            return this.paginator.current;
        },
        nextPages(){
            return Array.from({length: this.paginator.num_pages - this.paginator.current }, (e, i) => i + this.paginator.current + 1)
        },
    }
}

const CommentForm = {
    template: `
    <form @submit.prevent="submitForm" class="w-50 d-flex justify-content-center">
        <textarea v-model="comment" class="form-control"></textarea>
        <input type="submit" value="Comment" class="btn btn-sm btn-secondary w-100"/>
    </form>
    `,
    emits:{
        submitForm:null,
    },
    data(){return{
        comment: "",
        error:"",
    }},
    methods:{
        submitForm(){
            this.$emit("submitForm", this.comment)
            this.comment = "";
        }
    }
}

const Comment = {
    template: `
        <div className="card mb-2">
            <Avatar :username="username" :createdAt="createdAt" :id="userId" />
            <div className="card-body">
                {{content}}
            </div>
        </div>
    `,
    components: {Avatar,},
    props: ["comment",],
    computed:{
        username(){return this.comment.user.username;},
        userId(){return this.comment.user.id;},
        createdAt(){return this.comment.humanize_created_at;},
        content(){return this.comment.comment;},
    },
}

const PostForm = {
    template:`
    <form @submit.prevent="submitForm" class="m-3">
        <span>{{error}}</span>
        <textarea v-model="content" placeholder="Wazzaaaap" class="form-control"></textarea>
        <input type="submit" value="Create" class="btn btn-sm btn-primary m-1 w-100"/>
    </form>
    `,
    data(){return{
        content: "",
        error: "",
    }},
    emits:{
        submitForm: null,
    },
    methods:{
        submitForm(){
            this.$emit("submitForm", {content:this.content})
            this.content = "";
            this.error = "";
        }
    },
}
const Post = {
    template: `
        
        <div class="card mb-2">
            <Avatar :username="username" :createdAt="createdAt" :id="userId" :likes="likes" @like="like"/>
            <div class="card-body">
                <p v-if="!editing" class="card-text">
                    {{content}}
                </p>
                <form @submit.prevent="editPost" v-else>
                    <textarea v-model="editContent" :placeholder="content" class="form-control mb-2"></textarea>
                    <input type="submit" value="Save" class="btn btn-sm btn-success mr-2" />
                    <button @click="editing=false" class="btn btn-sm btn-danger mr-2" type="button">Cancel</button>
                </form>
                <div v-if="false" class="container">
                <Comment v-for="comment in comments" :key="comment.id" :comment="comment"/>
                </div>
                <CommentForm v-if="false" @submitForm="createComment"/>
                <a v-if="user && 'id' in user && post.user.id == user.id && !editing" @click="editing=true" href="#" class="btn btn-sm btn btn-secondary card-link">Edit</a>
            </div>
        </div>
    `,
    props: ["post"],
    emits: ["editContent"],
    components: {Comment, CommentForm, Avatar,},
    data(){return{
        editing: false,
        editContent: "",
    }},
    computed:{
        content(){return this.post.content;},
        username(){return this.post.user.username;},
        userId(){return this.post.user.id;},
        user(){return this.$store.getters.user;},
        createdAt(){return this.post.humanize_created_at},
        comments(){return this.post.comments},
        likes(){return this.post.likes},
    },
    methods:{
        editPost(){
            const data = {
                post_id: this.post.id,
                like: this.post.like,
                content: this.editContent
            }
            axios.put("/api/posts/", data)
            .then(response => {
                console.log(response)
                this.$emit("editContent", {id: this.post.id, content: response.data.content})
                this.editContent = "";
                this.editing = false;
            })
            .catch(error => console.log(error))
        },
        createComment(comment){
            const data = {
                comment: comment,
                post_id: this.post.id,
            }
            axios.post("/api/comment/", data)
            .then(response => {
                console.log(response)
                this.post.comments.push(response.data.comment)
            })
            .catch(error => console.log(error))
        },
        like(value){
            const data = {
                post_id: this.post.id,
                like: value,
                content: this.content,
            }
            axios.put("/api/posts/", data)
            .then(response => {
                console.log(response);
                this.post.likes = response.data.likes;
            })
        }
    }
}

const Home = {
    template:  `
    <div>
        <h4>All posts page!</h4>
        <PostForm v-if="isAuth" @submitForm="createPost"></PostForm>
        <div v-for="post in posts" :key="post.id">
            <Post :post="post" @editContent="editContent" />
        </div>
        <Paginator :paginator="paginator" @switchPage="getAllPosts"/>
    </div>
    `,
    components: {Paginator, PostForm, Post},
    data() {
        return {
            posts: [],
            paginator: {},
        }
    },
    computed:{
        isAuth(){return this.$store.getters.isAuth;},
    },
    methods:{
        editContent({id, content}){
            var index = this.posts.findIndex(post=>post.id == id)
            console.log("Edigin content", id, content, index)
            this.posts[index].content = content
        },
        createPost(content){
            axios.post(`/api/posts/`, content)
            .then(response => {
                console.log(response)
                this.posts.unshift(response.data.post)
            })
            .catch(error => console.log(error))
        },
        getAllPosts(pageNumber){
            if (pageNumber == null) pageNumber = 1;
            axios.get(`/api/posts/?page=${pageNumber}`)
            .then(response => {
                console.log(response);
                this.posts = response.data.posts;
                this.paginator = response.data.paginator;
            })
        }
    },
    created(){
        this.getAllPosts();
    }
}
const MainProfile = { 
    template: `
    <div>
        <h3>
            {{user.username}} profile page
            <span class="text-muted">
                <small>
                    Followers {{user.followers.length}}
                    // 
                    Following {{user.following.length}}
                </small>
            </span>
        </h3>
        <Post v-for="post in posts" :post=post :key="post.id" @editContent="editContent"/>
        <Paginator :paginator="paginator" @switchPage="getAllPosts"/>
    </div>
    `,
    components:{Post, Paginator},
    data(){return{
        posts: [],
        paginator: {},
    }},
    computed:{
        user(){return this.$store.state.user;},
    },
    // async beforeRouteEnter(to, from, next){},
    // async beforeRouteUpdate(to, from, next){},
    methods:{
        editContent({id, content}){
            var index = this.posts.findIndex(post=>post.id == id)
            console.log("Edigin content", id, content, index)
            this.posts[index].content = content
        },
        getAllPosts(pageNumber, user){
            if (pageNumber == null) pageNumber = 1;
            axios.get(`/api/posts/?page=${pageNumber}&username=${this.user? this.user.username : user.username}`)
            .then(response => {
                console.log(response);
                this.posts = response.data.posts;
                this.paginator = response.data.paginator;
            })
        }
    },
    mounted(){
        this.$store.dispatch("getUser").then(user=>this.getAllPosts(1, user))
        // this.$store.dispatch("getAllFilteredPosts")
    },

}
const Profile = { 
    template: 
    `
    <div v-if="profileUser != null">
        <h4>
            Profile {{profileUser.username}}
            <span class="text-muted m-2">
                <small>
                    Followers 
                    {{profileUser.followers.length}}
                    // 
                    Following {{profileUser.following.length}}
                </small>
            </span>
            <span>
                <button v-if="user && 'id' in user && user.id != profileUser.id && !user.following.includes(profileUser.username)" @click="follow(true)" class="btn btn-sm btn-info">Follow</button>
                <button v-if="user && 'id' in user && user.id != profileUser.id && user.following.includes(profileUser.username)" @click="follow(false)" class="btn btn-sm btn-info">UnFollow</button>
            </span>        
        </h4>
        <Post v-for="post in posts" :key="post.id" :post="post" @editContent="editContent"></Post>
        <Paginator :paginator="paginator" @switchPage="getUserPosts"></Paginator>
    </div>
    `,
    components: {Post, Paginator},
    data(){return{
        posts: [],
        paginator: {},
        profileUser: null,
    }},
    computed: {
        id(){ return this.$route.params.id},
        isAuth(){ return this.$store.getters.isAuth;},
        user(){return this.$store.getters.user},
    },
    methods:{
        editContent({id, content}){
            var index = this.posts.findIndex(post=>post.id == id)
            console.log("Edigin content", id, content, index)
            this.posts[index].content = content
        },
        follow(value){
            const data = {
                user: this.profileUser.id,
                follow: value
            }
            axios.post(`/api/follow/`, data)
            .then(response => {
                console.log(response)
                this.$store.dispatch("getUser")
                if(value) this.profileUser.followers.push(this.user.username);
                else this.profileUser.followers = this.profileUser.followers.filter(u => u != this.user.username);
            })
            .catch(error => console.log(error))
        },
        getUserPosts(pageNumber = 1){
            axios.get(`/api/user/?page=${pageNumber}&user_id=${this.id}`)
            .then(response => {
                console.log(response)
                this.posts = response.data.posts;
                this.paginator = response.data.paginator;
                this.profileUser = response.data.user;
            })
        }
    },
    created(){
        this.getUserPosts();
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
    computed:{
        user(){return this.$store.getters.user;},
        isAuth(){return this.$store.getters.isAuth;},
    },
    created(){
        this.$store.dispatch("login")
    }
})

const routes = [
    { path: '/', name: "Home",component: Home },
    { path: '/profile', name: "MainProfile", component: MainProfile, meta: {requiresAuth: true}},
    { path: '/profile/:id', name: "Profile", component: Profile },
    { path: '/:pathMatch(.*)', component: NotFound },
]

const router = createRouter({
    history: createWebHistory(),
    routes, // short for `routes: routes`
})
router.beforeEach((to, from, next) => {
    if (to.name == "MainProfile" && !store.getters.isAuth) next({name:"Home"})
    else next()
})

app.use(store)
app.use(router);