const Link = ReactRouterDOM.Link;
const Route = ReactRouterDOM.Route;
const Router = ReactRouterDOM.BrowserRouter
const Component = React.Component;
const Switch = ReactRouterDOM.Switch;
const Redirect = ReactRouterDOM.Redirect;


class Avatar extends Component {
    render() {
        return (
            <Link to={`/profile/${this.props.user.username}`} className="text-left text-monospace text-capitalize font-weight-bold text-decoration-none text-dark">
                {this.props.user.username}
            </Link>
        )
    }
}

class Paginator extends Component {
    constructor(props) {
        super(props);
        this.state = {
            handler: props.handler,
        };
    }
    render() {
        const before_pages = this.props.paginator.current - 1
        const after_pages = this.props.paginator.num_pages - this.props.paginator.current
        const offset = this.props.paginator.current 
        return (
            <nav aria-label="Page navigation example">
                <ul className="pagination">
                    {this.props.paginator.has_previus ? (
                        <li className="page-item">
                            <a className="page-link" onClick={(e) => this.state.handler(this.props.paginator.current - 1)}>
                                Previous
                        </a>
                        </li>
                    ) : ""}
                    {this.renderPrevius()}
                    <li className="page-item active" aria-current="page">
                        <a className="page-link">
                            {this.props.paginator.current}
                            <span className="sr-only">(current)</span>
                        </a>
                    </li>
                    {this.renderNexts(after_pages, offset)}
                    {this.props.paginator.has_next ? (
                        <li className="page-item">
                            <a className="page-link" onClick={(e) => this.state.handler(this.props.paginator.current + 1)}>
                                Next
                        </a>
                        </li>
                    ) : ""}
                </ul>
            </nav>
        );
    }
    renderPrevius = () => {
        return Array(this.props.paginator.current).fill(1).map((el, i) =>
            this.props.paginator.current > i + 1 ?
                (
                    <li key={i} className="page-item">
                        <a
                            className="page-link"
                            onClick={(e) => this.state.handler(i + 1)}>
                            {i + 1}
                        </a>
                    </li>
                ) : "");
            };
    renderNexts = (pages, offset) => {
        return Array.from({length: pages}, (e, i) => i + offset + 1).map(el => 
            (
                <li key={el} className="page-item">
                    <a 
                        className="page-link"
                        onClick={(e) => this.state.handler(el)}
                    >
                        {el}
                    </a>
                </li>
            )
        )
    }
    // todo improve
    // renderNexts = () => this.props.paginator.num_pages == undefined ? "" : Array(this.props.paginator.num_pages - this.props.paginator.current).fill(1).map((el, i) =>
    //     (
    //         <li className="page-item">
    //             <a
    //                 onClick={(e) => this.state.handler(i + 1)}
    //                 className="page-link">
    //                 {i + 1}
    //             </a>
    //         </li>
    //     )
    // )
}

const NewPostForm = (props) => {
    const handler = props.handler;
    const [content, setContent] = React.useState("")
    const submitPost = (e)=>{
        e.preventDefault();
        fetch('api/posts/', {
            method:"POST",
            body:JSON.stringify({
                content:content,
            }),
        }).then(r=>r.json()).then(data=>{
            console.log(data)
            setContent(old=>"");
            handler(data.post);
        });
        };

    return (
        <React.Fragment>
                <h6 className="m-0 p-0 mb-2">Create a new post</h6>
                 <form className="mr-5 ml-5" onSubmit={e=>submitPost(e)}>
                     <textarea 
                        value={content}
                        onChange={e=>setContent(old=>e.target.value)}
                         rows="2" 
                         className="form-control"
                         placeholder="Waaazaaap"
                         required
                     />
                     <button className="btn btn-sm btn-primary m-2">Post!</button>
                 </form>
        </React.Fragment>
    );
}

// class NewPostForm extends React.Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             content:""
//         }
//     }
//     render(){return (
//         <div className="m-5">
//             <textarea 
//                 value={this.state.content} 
//                 onChange={(e) => this.setState({ content: e.target.value })} 
//                 rows="2" 
//                 className="form-control"
//             />
//             <button onClick={this.submitPost} className="btn btn-sm btn-outline-primary m-2">Post!</button>
//         </div>
//     );}
//     submitPost = ()=>{
//         if (this.state.content === "") return;
//         var request = {
//             method:"POST",
//             body:JSON.stringify({content:this.state.content}),
//         }
//         fetch('/posts/', request).then(r=>r.json()).then(data=>{
//             console.log(data);
//             this.props.handler(data.post);
//             this.setState({content:""});
//         });
//     };
// }

class NavBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            handler: props.handler,
        }
    }
    render() {
        return (
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <a className="navbar-brand" href="#">Network</a>

                <div>
                    <ul className="navbar-nav mr-auto">
                        {is_authenticated ? (
                            <li className="nav-item">
                                <Link className="nav-link" to="" href="#"><strong>{username}</strong></Link>
                            </li>) : ""}
                        <li className={`nav-item ${this.props.page === 'all_posts' ? 'active' : ''}`}>
                            <Link className="nav-link" to="/">All Posts</Link>
                        </li>
                        {is_authenticated ? (
                            <li className={`nav-item ${this.props.page === 'following' ? 'active' : ''}`}>
                                <Link className="nav-link" to="/following" >Following</Link>
                            </li>) : ""}
                        {is_authenticated ? (
                            <li className={`nav-item ${this.props.page === 'profile' ? 'active' : ''}`}>
                                <Link className="nav-link" to={`/profile/${window.username}`} >Profile</Link>
                            </li>) : ""}
                        {is_authenticated ? (
                            <li className="nav-item">
                                <Link className="nav-link" /*to={logout}*/ onClick={this.logout}>Log Out</Link>
                            </li>) : ""}
                        {!is_authenticated ? (
                            <li className="nav-item">
                                <Link className="nav-link" /*to={login}*/ to="/login">Log In</Link>
                            </li>) : ""}
                        {!is_authenticated ? (
                            <li className="nav-item">
                                <Link className="nav-link" to={register}>Register</Link>
                            </li>) : ""}
                    </ul>
                </div>
            </nav>
        )
    }
    logout = (e) => fetch(`/api/logout/`).then(r=>{
        if (r.ok){ // TODO REFRESH
            location.reload();
        }
        return r.json()
    })
    ;
    goAllPosts = () => this.state.handler("all_posts");
    goFollowing = () => this.state.handler("following");
    goProfile = () => this.state.handler("profile");
}


class Comment extends Component {
    render() {
        return (
            <div>
                <div className="card border-top-0 rounded-top mt-1 mb-1 mr-5">
                    <div className="card-header rounded-pill">
                        <div className="d-flex">
                            <div className="mr-auto">
                                <Avatar user={this.props.comment.user} />
                            </div>
                            <small className="text-muted">
                                {this.props.comment.humanize_created_at}
                            </small>
                        </div>
                    </div>
                    <div className="card-body">
                        {this.props.comment.comment}
                    </div>
                </div>
            </div>
        )
    }
}

class CommentForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            comment: "",
            handler: props.handler,
        }
    }
    render() {
        return (
            <div className="form-group mr-5 mt-1 mb-1">
                <textarea className="form-control" value={this.state.comment} onChange={(e) => this.setState({ comment: e.target.value })} rows="2" />
                <button className="mt-1 btn btn-sm btn-dark" onClick={(e) => this.state.handler(this.state.comment)}>Comment</button>
            </div>
        )
    }
}

class CommentList extends Component {
    render() {
        return (
            <div>
                {this.props.comments.map(comment => (
                    <Comment key={comment.id} comment={comment} />
                ))}
            </div>
        );
    }
}
class Post extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: props.post.id,
            user: props.post.user,
            username: props.post.user.username,
            date: props.post.humanize_created_at,
            content: props.post.content,
            humanize_created_at: props.post.humanize_created_at,
            likes: props.post.likes,
            edit_content: props.post.content,
            edit: false,
            comments: props.post.comments,
            enable_comment: false,
            current_user: props.current_user,
        }
    }
    render() {
        return (
            <div>
                <div className="card border-top-0 rounded-top m-3">
                    <div className="card-header rounded-pill">
                        <div className="d-flex">
                            <div className="mr-auto">
                                <Avatar user={this.state.user} />
                            </div>
                            {
                                this.state.current_user && (
                                <div className="ml-4">
                                    <button className="ml-2 btn btn-sm btn-success" onClick={(e) => this.likeHandler(1)}>+1</button>
                                    <button className="ml-2 btn btn-sm btn-danger" onClick={(e) => this.likeHandler(-1)}>-1</button>
                                    <button className="ml-2 btn btn-sm btn-secondary" disabled>{this.state.likes}</button>

                                    {
                                        this.props.current_user != null && this.state.user.username == this.props.current_user.username ?
                                            <button className="ml-2 btn btn-sm btn-secondary" onClick={(e) => this.setState({ edit: !this.state.edit })}>
                                                {this.state.edit ? "Cancel" : "Edit"}
                                            </button>
                                            : ""
                                    }
                                </div>
                                )
                            }
                            <div className="ml-2">
                                <small className="text-muted">
                                    {this.state.humanize_created_at}
                                </small>
                            </div>
                        </div>

                    </div>
                    <div className="card-body">
                        {!this.state.edit ?
                            <div className="card-text p-2">{this.state.content}</div> :
                            (
                                <div className="form-group">
                                    <textarea
                                        onChange={(e) => this.setState({ edit_content: e.target.value })}
                                        className="form-control" rows="2" value={this.state.edit_content}
                                    />
                                    <button className="btn btn-lg btn-primary" onClick={this.contentEditorHandler}>Save</button>
                                </div>
                            )}
                        <CommentList comments={this.state.comments} />
                        {this.state.current_user && <CommentForm handler={this.commentHandler} />}
                        {/* {this.state.current_user && <button onClick={(e) => this.setState({ enable_comment: !this.state.enable_comment })} className="btn btn-sm btn-dark">Comment</button>} */}
                    </div>
                </div>
                <hr />
            </div>
        );
    }

    likeHandler = (add) => fetch(`/api/posts/`, { method: "put", body: JSON.stringify({ post_id: this.state.id, like: add }) }).then(r => r.json())
        .then(data => this.setState({ likes: data.likes }));
    contentEditorHandler = () => fetch(`/api/posts/`, { method: "put", body: JSON.stringify({ post_id: this.state.id, content: this.state.edit_content }) })
        .then(r => r.json()).then(data => this.setState({ content: data.content, edit: false, edit_content: data.content }));
    commentHandler = (comment) => comment === "" ? null : fetch(`/api/comment/`, { method: "post", body: JSON.stringify({ post_id: this.state.id, comment: comment }) })
        .then(r => r.json()).then(data => this.setState({ comments: [...this.state.comments, data.comment] }));
}

class AllPostPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            paginator: {},
            posts: [],
            user: null,
        };
        this.fetchPosts();
        this.fetchUser();
    }
    render() {
        return (
            <div className="container">
                <h2 className="m-3">All posts</h2>
                {this.state.user && <NewPostForm  handler={this.newPostHandler}/>}
                {this.state.posts.map((post) => (
                    <Post key={post.id} post={post} current_user={this.state.user} />
                ))}
                <Paginator handler={this.paginationHandler} paginator={this.state.paginator} />
            </div>
        );
    }
    newPostHandler = (post)=>this.setState(old =>({posts:[post, ...old.posts]}));
    paginationHandler = (page) => fetch(`/api/posts/?page=${page}`)
        .then(r => r.json())
        .then(data => this.setState({ posts: data.posts, paginator: data.paginator }));

    fetchPosts = () => fetch("/api/posts/").then(r => r.json())
        .then(data => this.setState({ posts: data.posts, paginator: data.paginator }));
    fetchUser = () => fetch("/api/user/").then(r => r.json())
        .then(data => this.setState({ user: data.user }));
}

class FollowingPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            paginator: {},
            posts: [],
            user: {},
            following: [],
        }
        this.fetchUser();
    }
    render() {
        return (
            <div className="container">
                <h2 className="m-3">All post from people that you follow</h2>
                {this.state.posts.lenght > 0 && this.state.posts.map((post) => (
                    <Post key={post.id} post={post} current_user={this.state.user} />
                )) || (<div className="text-monospace text-muted">You don't follow anyone</div>)}
                {this.state.posts.lenght > 0 && <Paginator handler={this.paginationHandler} paginator={this.state.paginator} />}
            </div>
        );
    }
    paginationHandler = (page) => fetch(`/api/posts/?following=${this.state.following.toString()}&page=${page}`)
        .then(r => r.json())
        .then(data => this.setState({ posts: data.posts, paginator: data.paginator }));

    fetchPosts = (following) => fetch(`/api/posts/?following=${this.state.following.toString() || following.toString}`).then(r => r.json())
        .then(data => this.setState({ posts: data.posts, paginator: data.paginator }));
    fetchUser = () => fetch("/api/user/").then(r => r.json())
        .then(data => {
            this.setState({ user: data.user, following: data.user.following });
            this.fetchPosts(data.user.following);
        });
}

function capFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}
class ProfilePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            current_user: props.current_user,
            user: null,
            following: [],
            followers: [],
            posts: null,
            paginator: {},
        };
        this.fetchUser();
    }

    render() {
        return (
            <div className="container">
                <h2>{capFirst(this.props.match.params.username)}'s profile <small>following {this.state.following.length} people/s and {this.state.followers.length} followers</small></h2>
                {this.renderFollow()}
                {this.state.posts && this.state.posts.map(post => (
                    <Post key={post.id} post={post} current_user={this.state.current_user}/>
                ))}
                <Paginator handler={this.paginationHandler} paginator={this.state.paginator} />
            </div>
        );
    }
    renderFollow = () => {
        if (this.props.current_user == null || this.state.user == null) return "";
        if (this.props.current_user.username != this.state.user.username && !this.state.followers.includes(this.props.current_user.username))
            return (<button className="btn btn-lg btn-dark" onClick={(e) => this.handleFollow(true)}>Follow</button>);
        else if (this.props.current_user.username != this.state.user.username && this.state.followers.includes(this.props.current_user.username))
            return (<button className="btn btn-lg btn-dark" onClick={(e) => this.handleFollow(false)}>Unfollow</button>);
        return "";
    };
    handleFollow = (data) => fetch(`/api/follow/`, { method: "POST", body: JSON.stringify({ follow: data, user: this.state.user.id }) }).then(this.fetchUser());
    fetchUser = () => fetch(`/api/user/?username=${this.props.match.params.username}`)
        .then(r => r.json()).then(data => this.setState({ user: data.user, following: data.user.following, followers: data.user.followers, posts: data.posts, paginator: data.paginator, }));
    paginationHandler = (page) => fetch(`/api/posts/?username=${this.props.match.params.username}&page=${page}`)
        .then(r => r.json())
        .then(data => this.setState({ posts: data.posts, paginator: data.paginator }));

}


class LoginPage extends Component {
    constructor(props){
        super(props);
        this.state = {
            username:"",
            password:"",
        };
    }
    render(){
        return (
            <div className="container">
                <h3>Login</h3>
                <form onSubmit={(e)=>this.submitHandler(e)}>
                    <div className="form-group">
                        <label htmlFor="id_username">Username</label>
                        <input id="id_username" autoComplete="username" className="form-control" type="text" value={this.state.username} onChange={(e)=>{this.setState({username:e.target.value})}}/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="id_password" >Password</label>
                        <input id="id_password" autoComplete="current-password" className="form-control" value={this.state.password} onChange={(e)=>{this.setState({password:e.target.value})}} type="password"/>
                    </div>
                    <input className="btn btn-lg btn-dark" value="Submit" type="submit"/>
            </form>
            </div>
        );
    }

    submitHandler = (e)=>{
        e.preventDefault();
        fetch(`api/login/`, {method:"POST", body:JSON.stringify({username:this.state.username, password:this.state.password})})
        .then(r=>{
            if (r.ok){
                this.props.history.push("/");
                location.reload();
            }
    });
        // .then(r=>r.ok?<Redirect to="/"/>:"");
    };
}

class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            current_user: this.fetchUser(),
        }
    }
    render() {
        return (
            <Router>
                <NavBar {...this.props} />
                <Switch>
                    <Route exact path="/">
                        <AllPostPage />
                    </Route>
                    <Route exact path="/profile/:username" render={(props) => <ProfilePage {...props} current_user={this.state.current_user} />} />
                    <Route exact path="/following" render={(props) => <FollowingPage {...props} current_user={this.state.current_user} />} />
                    <Route exact path="/login" render={(props) => <LoginPage {...props} />} />
                </Switch>
            </Router>
        )
    }
    fetchUser = () => fetch("/api/user/").then(r => r.json()).then(data => this.setState({ current_user: data.user, }));
}

ReactDOM.render(<App />, document.querySelector("#app"));