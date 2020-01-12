import React from "react";
import { Router, Link } from "@reach/router";

import { API_HOST } from "../../util";
import PostFeed from "../../components/PostFeed";
import FollowButton from "../../components/FollowButton";

import { UserContext } from "../../util";

import styles from "./index.module.css";

const FollowList = ({ ids, title }) => {
  return (
    <div>
      <div className={styles.followTitle}>{title}</div>
      {ids.map(id => (
        <div>
          <Link to={`/user/${id}`}>{id}</Link>
        </div>
      ))}
    </div>
  );
};

const Index = ({ feed }) => {
  if (feed.length === 0) {
    return "You're not following anyone yet!";
  } else {
    return <PostFeed posts={feed} />;
  }
};

class User extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      user: {},
      feed: []
    };
  }

  static contextType = UserContext;

  async componentDidMount() {
    // TODO handle errors
    const { walletId } = this.props;
    const feed = await fetch(
      `${API_HOST}/transactions?app-name=arweave-blog-0.0.1&wallet-id=${walletId}`
    ).then(res => res.json());

    const user = await fetch(
      `${API_HOST}/arweave-social/user/${walletId}`
    ).then(res => res.json());
    this.setState({ isLoaded: true, feed, user });
  }
  render() {
    const { walletId } = this.props;
    const { user: loggedInUser } = this.context;
    const { user, feed, isLoaded } = this.state;
    const { postCount, followerCount, followingCount } = user;
    const element = isLoaded ? (
      <div>
        <h1 className={styles.userName}>
          <Link to={`/user/${user.id}`}>{walletId}</Link>
        </h1>
        <div className={styles.userStats}>
          <div>
            <Link to={`/user/${user.id}`}>Posts</Link>: {postCount}
          </div>
          <div>
            <Link to={`/user/${user.id}/followers`}>Followers</Link>:{" "}
            {followerCount}
          </div>
          <div>
            <Link to={`/user/${user.id}/following`}>Following</Link>:{" "}
            {followingCount}
          </div>
          {loggedInUser && loggedInUser.address !== walletId ? (
            <div className={styles.followContainer}>
              <FollowButton walletId={walletId} />
            </div>
          ) : null}
        </div>
        <Router primary={false}>
          <Index path="/" feed={feed} />
          <FollowList
            path="/following"
            ids={user.followingIds}
            title="Following"
          />
          <FollowList
            path="/followers"
            ids={user.followerIds}
            title="Followers"
          />
        </Router>
      </div>
    ) : (
      "Loading..."
    );
    return element;
  }
}

export default User;