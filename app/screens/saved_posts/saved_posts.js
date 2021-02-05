// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {intlShape} from 'react-intl';
import {
    DeviceEventEmitter,
    Keyboard,
    FlatList,
    StyleSheet,
    View,
} from 'react-native';
import {Navigation} from 'react-native-navigation';
import {SafeAreaView} from 'react-native-safe-area-context';

import {dismissModal, goToScreen, showSearchModal} from '@actions/navigation';
import ChannelLoader from '@components/channel_loader';
import DateHeader from '@components/post_list/date_header';
import FailedNetworkAction from '@components/failed_network_action';
import NoResults from '@components/no_results';
import PostSeparator from '@components/post_separator';
import StatusBar from '@components/status_bar';
import {isDateLine, getDateForDateLine} from '@mm-redux/utils/post_list';
import SearchResultPost from '@screens/search/search_result_post';
import ChannelDisplayName from '@screens/search/channel_display_name';
import mattermostManaged from 'app/mattermost_managed';

export default class SavedPosts extends PureComponent {
    static propTypes = {
        actions: PropTypes.shape({
            clearSearch: PropTypes.func.isRequired,
            getPostThread: PropTypes.func.isRequired,
            getFlaggedPosts: PropTypes.func.isRequired,
            selectPost: PropTypes.func.isRequired,
            showPermalink: PropTypes.func.isRequired,
        }).isRequired,
        postIds: PropTypes.array,
        theme: PropTypes.object.isRequired,
    };

    static defaultProps = {
        postIds: [],
    };

    static contextTypes = {
        intl: intlShape.isRequired,
    };

    constructor(props) {
        super(props);

        props.actions.clearSearch();

        this.state = {
            didFail: false,
            isLoading: false,
        };
    }

    getFlaggedPosts = async () => {
        const {actions} = this.props;
        this.setState({isLoading: true});
        const {error} = await actions.getFlaggedPosts();

        this.setState({
            isLoading: false,
            didFail: Boolean(error),
        });
    }

    componentDidMount() {
        this.navigationEventListener = Navigation.events().bindComponent(this);

        this.getFlaggedPosts();
    }

    navigationButtonPressed({buttonId}) {
        if (buttonId === 'close-settings') {
            dismissModal();
        }
    }

    setListRef = (ref) => {
        this.listRef = ref;
    }

    goToThread = (post) => {
        const {actions} = this.props;
        const channelId = post.channel_id;
        const rootId = (post.root_id || post.id);
        const screen = 'Thread';
        const title = '';
        const passProps = {
            channelId,
            highlightPostId: post.id,
            rootId,
        };

        Keyboard.dismiss();
        actions.getPostThread(rootId);
        actions.selectPost(rootId);
        goToScreen(screen, title, passProps);
    };

    handlePermalinkPress = (postId, teamName) => {
        this.props.actions.showPermalink(this.context.intl, teamName, postId);
    };

    handleHashtagPress = async (hashtag) => {
        await dismissModal();
        showSearchModal('#' + hashtag);
    };

    keyExtractor = (item) => item;

    onViewableItemsChanged = ({viewableItems}) => {
        if (!viewableItems.length) {
            return;
        }

        const viewableItemsMap = viewableItems.reduce((acc, {item, isViewable}) => {
            if (isViewable) {
                acc[item] = true;
            }
            return acc;
        }, {});

        DeviceEventEmitter.emit('scrolled', viewableItemsMap);
    };

    previewPost = (post) => {
        const {showPermalink} = this.props.actions;
        Keyboard.dismiss();

        showPermalink(this.context.intl, '', post.id, false);
    };

    renderEmpty = () => {
        const {formatMessage} = this.context.intl;
        const {theme} = this.props;

        return (
            <NoResults
                description={formatMessage({
                    id: 'mobile.flagged_posts.empty_description',
                    defaultMessage: 'Saved messages are only visible to you. Mark messages for follow-up or save something for later by long-pressing a message and choosing Save from the menu.',
                })}
                iconName='bookmark-outline'
                title={formatMessage({id: 'mobile.flagged_posts.empty_title', defaultMessage: 'No Saved messages yet'})}
                theme={theme}
            />
        );
    };

    renderPost = ({item, index}) => {
        const {postIds, theme} = this.props;

        if (isDateLine(item)) {
            return (
                <DateHeader
                    date={getDateForDateLine(item)}
                    index={index}
                />
            );
        }

        let separator;
        const nextPost = postIds[index + 1];
        if (nextPost && !isDateLine(nextPost)) {
            separator = <PostSeparator theme={theme}/>;
        }

        return (
            <View>
                <ChannelDisplayName postId={item}/>
                <SearchResultPost
                    postId={item}
                    previewPost={this.previewPost}
                    highlightPinnedOrFlagged={false}
                    goToThread={this.goToThread}
                    onHashtagPress={this.handleHashtagPress}
                    onPermalinkPress={this.handlePermalinkPress}
                    managedConfig={mattermostManaged.getCachedConfig()}
                    showFullDate={false}
                    skipFlaggedHeader={true}
                    skipPinnedHeader={true}
                />
                {separator}
            </View>
        );
    };

    retry = () => {
        this.getFlaggedPosts();
    };

    render() {
        const {postIds, theme} = this.props;
        const {didFail, isLoading} = this.state;

        let component;
        if (didFail) {
            component = (
                <FailedNetworkAction
                    onRetry={this.retry}
                    theme={theme}
                />
            );
        } else if (isLoading) {
            component = (
                <ChannelLoader channelIsLoading={true}/>
            );
        } else if (postIds.length) {
            component = (
                <FlatList
                    ref={this.setListRef}
                    contentContainerStyle={style.sectionList}
                    data={postIds}
                    keyExtractor={this.keyExtractor}
                    keyboardShouldPersistTaps='always'
                    keyboardDismissMode='interactive'
                    renderItem={this.renderPost}
                    onViewableItemsChanged={this.onViewableItemsChanged}
                />
            );
        } else {
            component = this.renderEmpty();
        }

        return (
            <SafeAreaView
                testID='saved_messages.screen'
                style={style.container}
            >
                <StatusBar/>
                {component}
            </SafeAreaView>
        );
    }
}

const style = StyleSheet.create({
    container: {
        flex: 1,
    },
});
