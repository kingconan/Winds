import { getPinnedArticles } from '../util/pins';
import { getFeed } from '../util/feeds';
import { getArticle } from '../selectors';
import ArticleListItem from './ArticleListItem';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

class RecentArticlesList extends React.Component {
	componentDidMount() {
		getPinnedArticles(this.props.dispatch);
		getFeed(this.props.dispatch, 'article', 0, 20);
	}
	render() {
		return (
			<React.Fragment>
				<div className="list-view-header content-header">
					<h1>Recent Articles</h1>
				</div>

				<div className="list content">
					{this.props.articles.map(article => {
						return <ArticleListItem key={article._id} {...article} />;
					})}
				</div>
			</React.Fragment>
		);
	}
}

RecentArticlesList.defaultProps = {
	articles: [],
};

RecentArticlesList.propTypes = {
	articles: PropTypes.arrayOf(PropTypes.shape({})),
	dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => {
	let articles = [];
	let userArticleFeed = [];
	if (state.feeds && state.feeds[`user_article:${localStorage['authedUser']}`]) {
		userArticleFeed = state.feeds[`user_article:${localStorage['authedUser']}`];
	}
	for (let articleID of userArticleFeed) {
		// need to trim the `episode:` from the episode ID
		articles.push(getArticle(state, articleID.replace('article:', '')));
	}

	for (let article of articles) {
		// attach pinned state
		if (state.pinnedArticles && state.pinnedArticles[article._id]) {
			article.pinned = true;
			article.pinID = state.pinnedArticles[article._id]._id;
		} else {
			article.pinned = false;
		}

		if (
			state.feeds[`user_article:${localStorage['authedUser']}`].indexOf(
				article._id,
			) < 20 &&
			state.feeds[`user_article:${localStorage['authedUser']}`].indexOf(
				article._id,
			) !== -1
		) {
			article.recent = true;
		} else {
			article.recent = false;
		}
	}

	return { ...ownProps, articles: articles.slice(0, 20) };
};

export default connect(mapStateToProps)(RecentArticlesList);
