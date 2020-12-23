class LikeButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            handler: props.handler,
            add: props.add,
            disabled: false,
            className: props.className
        }
    }
    render() {
        if (is_authenticated){

            return (
                <button onClick={this.onclick} className={this.state.className} disabled={this.state.disabled}>{this.state.add}</button>
                );
        }
        return ("");
    }
    onclick = () => { // todo: prevent multiple clicks, and only one for user? must be database register for that
        // if (this.state.disabled == true) return;
        // this.setState({disabled:true});
        this.state.handler();
    };
}

class Comment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: props.comment.id,
            user: props.comment.user,
            comment: props.comment.comment,
            post_id: props.comment.post_id,
            created_at: props.comment.created_at,
            humanize_created_at: props.comment.humanize_created_at,
        };
    }
    render() {
        return (
            <div className="card mt-2 ml-0 mr-5">
                <div className="card-header pb-0 pt-0">
                    <p className="card-text d-flex">
                        <strong className="mr-auto">
                            {this.state.user.username}
                        </strong>
                        <small className="text-muted">
                            {this.state.humanize_created_at}
                        </small>
                    </p>
                </div>
                <div className="card-body">
                    {this.state.comment}
                </div>
            </div>
        );
    }
}

class Post extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            switchPage: props.switchPage,
            content: props.post.content,
            user: props.post.user,
            likes: props.post.likes,
            id: props.post.id,
            created_at: props.post.created_at,
            humanize_created_at: props.post.humanize_created_at,
            comments: props.post.comments,
            comment_text: "",
            edit: false, // ! start as false
            edit_content: props.post.content,
        };
    }
    render() {
        return (
            <div>
                <div className="card">
                    <div className="card-header pb-0 pt-0">
                        <div className="d-flex card-text">
                            <strong className="mr-auto">
                                <a onClick={(e)=>this.state.switchPage("profile")}>
                                    {this.state.user.username}
                                </a>
                            </strong>
                            <div className="mr-2">
                                <LikeButton handler={this.plusOneHandler} add="+1" className="btn btn-sm btn-outline-success ml-2" />
                                <LikeButton handler={this.minusOneHandler} add="-1" className="btn btn-sm btn-outline-danger ml-2" />
                            </div>
                            <button className="btn btn-sm btn-secondary mr-2 disabled">
                                {this.state.likes}
                            </button>
                            <small className="text-muted">
                                {this.state.user.email}
                                {this.state.humanize_created_at}
                            </small>
                            {this.state.user.username == window.username ?// ? Is a good practice to use it this way?
                            (<button className="btn btn-sm btn-outline-dark ml-2" onClick={() => this.setState({ edit: !this.state.edit })}>
                                {this.state.edit ? "Cancel" : "Edit"}
                            </button>) :""}
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="card-text">
                            {this.state.edit == false ?
                            this.state.content :(
                            <div>
                                <textarea value={this.state.edit_content}
                                    onChange={(e) => this.setState({ edit_content: e.target.value })}
                                    className="form-control"
                                />
                                <button onClick={this.editHandler} className="btn btn-small btn-outline-success m-1">
                                    Save
                                </button>
                            </div>
                            )}
                        </div>
                    </div>
                    {this.state.comments.map(comment => (
                        <Comment key={comment.id} comment={comment} />
                    ))}
                </div>
                {is_authenticated?
                <div className="pr-5 pt-1 form-group">
                    <textarea className="form-control"
                        type="text" value={this.state.comment_text} onChange={this.commentHandler}
                        placeholder="Comment" rows="3" required maxLength={500} minLength={5} />
                    <button className="btn btn-sm mt-2 btn-outline-secondary" onClick={this.comment}>Add comment</button>
                </div>:""}
                <hr />
            </div>
        )
    }
    plusOneHandler = () => this.likeHandler(+1);
    minusOneHandler = () => this.likeHandler(-1);
    likeHandler = (add) => {
        var request = {
            method: "put",
            body: JSON.stringify({
                post_id: this.state.id,
                like: add,
            }),
        };
        fetch("/posts/", request).then(r => r.json())
            .then(data => this.setState({ likes: data.likes }));
    };
    commentHandler = (event) => this.setState({ comment_text: event.target.value });
    comment = () => {
        if (this.state.comment_text === "") return; // ? Prevents empty data
        var request = {
            method: "post",
            body: JSON.stringify({
                comment: this.state.comment_text,
                post_id: this.state.id,
            }),
        };
        fetch("/comment/", request).then(response => response.json())
            .then(data => this.setState({
                comments: [...this.state.comments, data.message],
                comment_text: "",
            }));
    };

    editHandler = () => {
        var request = {
            method: "put",
            body: JSON.stringify({
                post_id: this.state.id,
                content: this.state.edit_content,
            }),
        };
        fetch("/posts/", request).then(r => r.json())
            .then(data => this.setState({ content: data.content, edit_content: data.content, edit: false, }),)
            .catch(e => this.setState({ edit: false, edit_content: this.state.content }));
    };
}

class Paginator extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            handler: props.handler,
        };
    }
    render() {
        return (
            <nav aria-label="Page navigation example">
                <ul className="pagination">
                    {this.props.paginator.has_previus ? (
                        <li className="page-item">
                            <a className="page-link" onClick={this.previusPage}>
                                Previous
                    </a>
                        </li>
                    ) : ""}
                    <li className="page-item active" aria-current="page">
                        <a className="page-link">
                            {this.props.paginator.current}
                            <span className="sr-only">(current)</span>
                        </a>
                    </li>
                    {this.props.paginator.has_next ? (
                        <li className="page-item">
                            <a className="page-link" onClick={this.nextPage}>
                                Next
                    </a>
                        </li>
                    ) : ""}
                </ul>
            </nav>
        );
    }
    previusPage = () => this.state.handler(this.props.paginator.current - 1);
    nextPage = () => this.state.handler(this.props.paginator.current + 1);
}

class NewPostForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content:""
        }
    }
    render(){return (
        <div className="m-5">
            <textarea 
                value={this.state.content} 
                onChange={(e) => this.setState({ content: e.target.value })} 
                rows="2" 
                className="form-control"
            />
            <button onClick={this.submitPost} className="btn btn-sm btn-outline-primary m-2">Post!</button>
        </div>
    );}
    submitPost = ()=>{
        if (this.state.content === "") return;
        var request = {
            method:"POST",
            body:JSON.stringify({content:this.state.content}),
        }
        fetch('/posts/', request).then(r=>r.json()).then(data=>{
            console.log(data);
            this.props.handler(data.post);
            this.setState({content:""});
        });
    };
}

class PostList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            switchPage:props.switchPage,
            page:props.page,
            posts: [],
            paginator: null,
            username:props.username,
        };
        this.fetchPosts();
        
    }
    render() {
        return this.state.posts && this.state.paginator ? (
            <div className="container m-5">
                <h2 className="m-3">
                    {this.state.page}
                </h2>
                {this.props.user?
                <NewPostForm handler={this.addPost}/>:                (
                <div>
                    You must be <a href={login}>login</a> first to post. If you don't have an account you must <a href={register}>register</a>.
                </div>
                )}
                {this.state.posts.map(item => (
                    <Post switchPage={this.state.switchPage} key={item.id} post={item} />
                ))}
                <Paginator handler={this.paginationHandler} paginator={this.state.paginator} />
            </div>
        ) :
            "Loading";
    }
    fetchPosts = (page)=>{
        var url = "/posts/";
        if (this.props.user != null && this.state.page == "Following"){ // ?
            url += "?following=" + this.props.user.following.toString()
        } 
        if (page != null) url.includes("?")? url+="&page="+page:url+="?page="+page;
        fetch(url).then(r => r.json())
            .then(data => this.setState({ posts: data.posts, paginator: data.paginator }));
    };

    paginationHandler = (page) => this.fetchPosts(page);
    addPost = (post) =>this.setState({posts: [post, ...this.state.posts]});

}


class NavBar extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            handler:props.handler,
        }
    }
    render() {
        return (
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <a className="navbar-brand" href="#">Network</a>

                <div>
                    <ul className="navbar-nav mr-auto">
                        {is_authenticated ?(
                        <li className="nav-item">
                            <a className="nav-link" href="#"><strong>{username}</strong></a>
                        </li>) : ""}
                        <li className={`nav-item ${this.props.page === 'all_posts'?'active':''}`}>
                            <a className="nav-link" onClick={this.goAllPosts}>All Posts</a>
                        </li>
                        {is_authenticated ?(
                        <li className={`nav-item ${this.props.page === 'following'?'active':''}`}>
                            <a className="nav-link" onClick={this.goFollowing}>Following</a>
                        </li>):""}
                        {is_authenticated ?(
                        <li className={`nav-item ${this.props.page === 'profile'?'active':''}`}>
                            <a className="nav-link" onClick={this.goProfile}>Profile</a>
                        </li>):""}
                        {is_authenticated ?(
                        <li className="nav-item">
                            <a className="nav-link" href={logout}>Log Out</a>
                        </li>):""} 
                        {!is_authenticated ?(
                        <li className="nav-item">
                            <a className="nav-link" href={login}>Log In</a>
                        </li>):""}
                        {!is_authenticated ?(
                        <li className="nav-item">
                            <a className="nav-link" href={register}>Register</a>
                        </li>):""}
                    </ul>
                </div>
            </nav>
        )
    }
    goAllPosts = ()=>this.state.handler("all_posts");
    goFollowing = ()=>this.state.handler("following");
    goProfile = ()=>this.state.handler("profile");
}

class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user:props.user,
            username:props.user.username,
            following:props.user.following,
            followers:props.user.followers,
            posts:[],
            paginator:{},
        };
        this.fetchUserPosts();
    }
    render(){return(
        <div>
            <div className="container">
                <h3>Profile page</h3>
                Followers: {this.state.followers.length}
            </div>
            <div className="container">
                {this.state.posts.map(post => (
                    <Post key={post.id} post={post}/>
                ))}
                <Paginator handler={this.fetchUserPosts} paginator={this.state.paginator} />
            </div>

        </div>
    );}
    
    fetchUserPosts = (page)=>{
        var url = `/posts/?username=${this.state.username}`;
        if (page != null) url += "&page=" + page;
        fetch(url).then(r=>r.json())
        .then(data=>this.setState({posts:data.posts, paginator:data.paginator,}));
    };
}

class App extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            page:"all_posts",
            user:null,
        };
        fetch('/user/').then(r=>r.json()).then(data=>this.setState({user:data}));
    }
    render() {
        return (
            <div>
                <NavBar handler={this.switchPage} page={this.state.page}/>
                <div className="container-fluid">
                    {this.state.page === "all_posts"?
                        <PostList switchPage={this.switchPage} key="all_posts" user={this.state.user} page="All posts"/>:
                    this.state.page === "following"?
                        <PostList switchPage={this.switchPage} key="following" user={this.state.user} username={window.username} page="Following"/>:
                    this.state.page === "profile"?
                        <Profile page="Profile" key="profile" user={this.state.user} />
                        :""
                    }
                </div>
            </div>
        )
    }
    switchPage = (page)=>this.setState({page:page});
}

ReactDOM.render(<App />, document.querySelector("#app"));