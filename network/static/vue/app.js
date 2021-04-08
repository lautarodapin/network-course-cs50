const { createApp } = Vue;
const { createStore } = Vuex;
const { createRouter, createWebHashHistory } = VueRouter;
const store = createStore({
    state(){
        return {
            user: {},
        }
    },
    getters: {
        user: (state) => state.user,
        isAuth: (state) => state.user?state.user.is_authenticated:false,
    },
    mutations: {
        login(state, user){
            state.user = user
        },
        logout(state){
            state.user = {}
        }
    },
    actions: {
        login({context, commit}){
            axios.get("/api/user/")
            .then(response => {
                console.log(response)
                commit("login", response.data.user)
            })
            .catch(error => {console.log(error)})
        },
        logout({context, commit}){
            commit("logout")
        },
    },
})

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
            <div className="card-header">
                {{username}}
                <span className="text-muted">
                    {{createdAt}}
                </span>
            </div>
            <div className="card-body">
                {{content}}
            </div>
        </div>
    `,
    props: ["comment",],
    computed:{
        username(){return this.comment.user.username;},
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
            <div class="card-header">
                {{username}}
                <span class="text-muted">
                    {{createdAt}}
                </span>
                <span>
                    <button @click="like(1)" class="btn btn-success btn-sm ml-2">+1</button>
                    <button @click="like(-1)" class="btn btn-danger btn-sm ml-2">-1</button>
                    <button type="button" class="btn btn-primary btn-sm ml-2">
                        <span class="badge badge-light">
                            {{likes}}
                        </span>
                    </button>
                </span>
            </div>
            <div class="card-body">
                {{content}}
                <div class="container">
                    <Comment v-for="comment in comments" :key="comment.id" :comment="comment"/>
                </div>
                <CommentForm @submitForm="createComment"/>
            </div>
        </div>
    `,
    props: ["post"],
    components: {Comment, CommentForm},
    computed:{
        content(){return this.post.content;},
        username(){return this.post.user.username;},
        createdAt(){return this.post.humanize_created_at},
        comments(){return this.post.comments},
        likes(){return this.post.likes},
    },
    methods:{
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
            <Post :post="post" />
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
    { path: '/profile', name: "MainProfile", component: MainProfile },
    { path: '/profile/:id', name: "Profile", component: Profile },
    { path: '/:pathMatch(.*)', component: NotFound },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes, // short for `routes: routes`
})


app.use(store)
app.use(router);