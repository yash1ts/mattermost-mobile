// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {
    Keyboard,
    ScrollView,
    Text,
    View,
} from 'react-native';
import {intlShape} from 'react-intl';
import {Posts} from '@mm-redux/constants';

import CompassIcon from '@components/compass_icon';
import CombinedSystemMessage from '@components/combined_system_message';
import FormattedText from '@components/formatted_text';
import Markdown from '@components/markdown';
import MarkdownEmoji from '@components/markdown/markdown_emoji';
import ShowMoreButton from '@components/show_more_button';
import TouchableWithFeedback from '@components/touchable_with_feedback';

import {emptyFunction} from '@utils/general';
import {getMarkdownTextStyles, getMarkdownBlockStyles} from '@utils/markdown';
import {preventDoubleTap} from '@utils/tap';
import {changeOpacity, makeStyleSheetFromTheme} from '@utils/theme';
import {showModalOverCurrentContext} from '@actions/navigation';

import telemetry from '@telemetry';

import {renderSystemMessage} from './system_message_helpers';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

let FileAttachmentList;
let PostAddChannelMember;
let PostBodyAdditionalContent;
let Reactions;

const SHOW_MORE_HEIGHT = 60;

export default class PostBody extends PureComponent {
    static propTypes = {
        actions: PropTypes.shape({
            setReplyPopup: PropTypes.func.isRequired,
        }).isRequired,
        canDelete: PropTypes.bool,
        channelIsReadOnly: PropTypes.bool.isRequired,
        deviceHeight: PropTypes.number.isRequired,
        fileIds: PropTypes.array,
        hasBeenDeleted: PropTypes.bool,
        hasBeenEdited: PropTypes.bool,
        hasReactions: PropTypes.bool,
        highlight: PropTypes.bool,
        isFailed: PropTypes.bool,
        isFlagged: PropTypes.bool,
        isLastPost: PropTypes.bool,
        isPending: PropTypes.bool,
        isPostAddChannelMember: PropTypes.bool,
        isPostEphemeral: PropTypes.bool,
        isReplyPost: PropTypes.bool,
        isSearchResult: PropTypes.bool,
        isSystemMessage: PropTypes.bool,
        metadata: PropTypes.object,
        managedConfig: PropTypes.object,
        message: PropTypes.string,
        onFailedPostPress: PropTypes.func,
        onHashtagPress: PropTypes.func,
        onPermalinkPress: PropTypes.func,
        onPress: PropTypes.func,
        post: PropTypes.object.isRequired,
        postProps: PropTypes.object.isRequired,
        postType: PropTypes.string,
        replyBarStyle: PropTypes.array,
        showAddReaction: PropTypes.bool,
        showLongPost: PropTypes.bool.isRequired,
        isEmojiOnly: PropTypes.bool.isRequired,
        shouldRenderJumboEmoji: PropTypes.bool.isRequired,
        theme: PropTypes.object,
        location: PropTypes.string,
        mentionKeys: PropTypes.array,
        displayName: PropTypes.string,
        commentedOnDisplayName: PropTypes.string,
        mergeMessage: PropTypes.bool,
        currentUserId: PropTypes.string,
        commentedOnPost: PropTypes.object,
        enableSwipe: PropTypes.bool,
    };

    static defaultProps = {
        fileIds: [],
        onFailedPostPress: emptyFunction,
        onPress: emptyFunction,
        replyBarStyle: [],
        mentionKeys: [],
        message: '',
        postProps: {},
    };

    static contextTypes = {
        intl: intlShape.isRequired,
    };

    static getDerivedStateFromProps(nextProps, prevState) {
        const maxHeight = Math.round((nextProps.deviceHeight * 0.6) + SHOW_MORE_HEIGHT);
        if (maxHeight !== prevState.maxHeight) {
            return {
                maxHeight,
            };
        }

        return null;
    }

    state = {
        isLongPost: false,
    };

    logTelemetry = () => {
        telemetry.end([
            'channel:switch_initial',
            'channel:switch_loaded',
            'post_list:permalink',
            'post_list:thread',
            'team:switch',
            'start:overall',
        ]);
        telemetry.save();
    }

    measurePost = (event) => {
        const {height} = event.nativeEvent.layout;
        const {showLongPost} = this.props;

        if (!showLongPost) {
            this.setState({
                isLongPost: height >= this.state.maxHeight,
            });
        }

        if (this.props.isLastPost) {
            this.logTelemetry();
        }
    };

    openLongPost = preventDoubleTap(() => {
        const {
            managedConfig,
            onHashtagPress,
            onPermalinkPress,
            post,
        } = this.props;
        const screen = 'LongPost';
        const passProps = {
            postId: post.id,
            managedConfig,
            onHashtagPress,
            onPermalinkPress,
        };
        const options = {
            layout: {
                componentBackgroundColor: changeOpacity('#000', 0.2),
            },
        };

        showModalOverCurrentContext(screen, passProps, options);
    });

    showPostOptions = () => {
        const {
            canDelete,
            channelIsReadOnly,
            hasBeenDeleted,
            isFailed,
            isFlagged,
            isPending,
            isPostEphemeral,
            isSystemMessage,
            managedConfig,
            post,
            showAddReaction,
            location,
            displayName,
            enableSwipe,
        } = this.props;

        if (isSystemMessage && (!canDelete || hasBeenDeleted)) {
            return;
        }

        if (isPending || isFailed || isPostEphemeral) {
            return;
        }

        const screen = 'PostOptions';
        const passProps = {
            canDelete,
            channelIsReadOnly,
            hasBeenDeleted,
            isFlagged,
            isSystemMessage,
            post,
            managedConfig,
            showAddReaction,
            location,
            enableSwipe,
            displayName,
        };

        Keyboard.dismiss();
        requestAnimationFrame(() => {
            showModalOverCurrentContext(screen, passProps);
        });
    };

    renderAddChannelMember = (messageStyle, textStyles) => {
        const {onPress, postProps} = this.props;

        if (!PostAddChannelMember) {
            PostAddChannelMember = require('app/components/post_add_channel_member').default;
        }

        const postId = postProps.add_channel_member.post_id;
        const noGroupsUsernames = postProps.add_channel_member?.not_in_groups_usernames; // eslint-disable-line camelcase
        let userIds = postProps.add_channel_member?.not_in_channel_user_ids; // eslint-disable-line camelcase
        let usernames = postProps.add_channel_member?.not_in_channel_usernames; // eslint-disable-line camelcase

        if (!userIds) {
            userIds = postProps.add_channel_member?.user_ids; // eslint-disable-line camelcase
        }
        if (!usernames) {
            usernames = postProps.add_channel_member?.usernames;
        }

        return (
            <PostAddChannelMember
                baseTextStyle={messageStyle}
                onPostPress={onPress}
                textStyles={textStyles}
                postId={postId}
                userIds={userIds}
                usernames={usernames}
                noGroupsUsernames={noGroupsUsernames}
            />
        );
    };

    renderFileAttachments() {
        const {
            fileIds,
            isFailed,
            post,
            showLongPost,
        } = this.props;

        if (showLongPost) {
            return null;
        }

        let attachments;
        if (fileIds.length) {
            if (!FileAttachmentList) {
                FileAttachmentList = require('app/components/file_attachment_list').default;
            }

            attachments = (
                <FileAttachmentList
                    fileIds={fileIds}
                    isFailed={isFailed}
                    onLongPress={this.showPostOptions}
                    postId={post.id}
                    isReplyPost={this.props.isReplyPost}
                />
            );
        }
        return attachments;
    }

    renderPostAdditionalContent = (blockStyles, messageStyle, textStyles) => {
        const {
            isPostEphemeral,
            isReplyPost,
            isSystemMessage,
            message,
            metadata,
            onHashtagPress,
            onPermalinkPress,
            post,
            postProps,
        } = this.props;

        if (isSystemMessage && !isPostEphemeral) {
            return null;
        }

        if (!metadata?.embeds?.length) {
            return null;
        }

        if (!PostBodyAdditionalContent) {
            PostBodyAdditionalContent = require('app/components/post_body_additional_content').default;
        }

        return (
            <PostBodyAdditionalContent
                baseTextStyle={messageStyle}
                blockStyles={blockStyles}
                message={message}
                metadata={metadata}
                postId={post.id}
                postProps={postProps}
                textStyles={textStyles}
                isReplyPost={isReplyPost}
                onHashtagPress={onHashtagPress}
                onPermalinkPress={onPermalinkPress}
            />
        );
    };

    renderReactions = () => {
        const {
            hasReactions,
            isSearchResult,
            post,
            showLongPost,
        } = this.props;

        if (!hasReactions || isSearchResult || showLongPost) {
            return null;
        }

        if (!Reactions) {
            Reactions = require('app/components/reactions').default;
        }

        return (
            <Reactions
                postId={post.id}
            />
        );
    };

    renderCommentedOnMessage = () => {
        const {
            post,
            theme,
            mergeMessage,
            commentedOnPost,
            commentedOnDisplayName,
        } = this.props;

        const style = getStyleSheet(theme);
        const displayName = post.props?.reply_user_name || commentedOnDisplayName;

        if (!displayName) {
            return null;
        }

        let name;
        if (displayName) {
            name = displayName;
        } else {
            name = (
                <FormattedText
                    id='channel_loader.someone'
                    defaultMessage='Someone'
                />
            );
        }

        let apostrophe;
        if (displayName && displayName.slice(-1) === 's') {
            apostrophe = '\'';
        } else {
            apostrophe = '\'s';
        }
        const commentedOnContainer = {...style.commentedOnContainer};
        if (mergeMessage) {
            commentedOnContainer.borderTopStartRadius = 5;
        }
        if (post.root_id && !post.props?.reply_message) {
            return (
                <View
                    style={commentedOnContainer}
                >
                    <FormattedText
                        id='post_body.commentedOn'
                        defaultMessage='Commented on {name}{apostrophe} message: '
                        values={{
                            name,
                            apostrophe,
                        }}
                        style={style.commentedOn}
                    />
                    <Text>{commentedOnPost.message}</Text>
                </View>
            );
        }
        return (
            <View
                style={commentedOnContainer}
            >
                <FormattedText
                    id='post_body.commentedOn'
                    defaultMessage='Commented on {name}{apostrophe} message: '
                    values={{
                        name,
                        apostrophe,
                    }}
                    style={style.commentedOn}
                />
                <Text>{post.props?.reply_message}</Text>
            </View>
        );
    };
    swipeableRef = React.createRef(null);

    render() {
        const {
            hasBeenDeleted,
            hasBeenEdited,
            highlight,
            isEmojiOnly,
            isFailed,
            isPending,
            isPostAddChannelMember,
            isReplyPost,
            isSearchResult,
            isSystemMessage,
            message,
            metadata,
            onFailedPostPress,
            onHashtagPress,
            onPermalinkPress,
            onPress,
            post,
            postProps,
            postType,
            replyBarStyle,
            shouldRenderJumboEmoji,
            showLongPost,
            theme,
            mentionKeys,
            displayName,
            currentUserId,
            mergeMessage,
            commentedOnDisplayName,
            enableSwipe,
        } = this.props;
        const {isLongPost, maxHeight} = this.state;
        const style = getStyleSheet(theme);
        const blockStyles = getMarkdownBlockStyles(theme);
        const textStyles = getMarkdownTextStyles(theme);
        const messageStyle = isSystemMessage ? [style.message, style.systemMessage] : style.message;
        const isPendingOrFailedPost = isPending || isFailed;

        const leftActions = () => {
            if (!enableSwipe) {
                return null;
            }
            return (
                <View style={{marginStart: 80}}/>);
        };
        const openReply = () => {
            const options = {
                enableVibrateFallback: true,
                ignoreAndroidSystemSettings: true,
            };
            this.swipeableRef.current.close();
            ReactNativeHapticFeedback.trigger('selection', options);
            const trimmedInitial = post.message.length > 500 ? post.message.slice(0, 500) + '...' : post.message;
            const trimmedFormat = trimmedInitial.split('\n');
            let trimmedFinal = trimmedInitial;
            if (trimmedFormat.length > 5) {
                trimmedFinal = trimmedFormat[0];
                for (let i = 1; i < 6; i++) {
                    trimmedFinal += `\n${trimmedFormat[i]}`;
                }
                trimmedFinal += '...';
            }
            const passProp = {
                root_id: (post.root_id || post.id),
                user_name: displayName,
                message: trimmedFinal,
            };
            this.props.actions.setReplyPopup(passProp);
        };

        const messageStyles = {messageStyle, textStyles};
        const intl = this.context.intl;
        const systemMessage = renderSystemMessage(this.props, messageStyles, intl);
        if (systemMessage) {
            return systemMessage;
        }

        let body;
        let messageComponent;
        if (hasBeenDeleted) {
            body = (
                <FormattedText
                    style={messageStyle}
                    id='post_body.deleted'
                    defaultMessage='(message deleted)'
                />
            );
        } else if (isPostAddChannelMember) {
            messageComponent = this.renderAddChannelMember(messageStyle, textStyles);
        } else if (postType === Posts.POST_TYPES.COMBINED_USER_ACTIVITY) {
            const {allUserIds, allUsernames, messageData} = postProps.user_activity;
            messageComponent = (
                <CombinedSystemMessage
                    allUserIds={allUserIds}
                    allUsernames={allUsernames}
                    linkStyle={textStyles.link}
                    messageData={messageData}
                    textStyles={textStyles}
                    theme={theme}
                />
            );
        } else if (isEmojiOnly) {
            messageComponent = (
                <MarkdownEmoji
                    baseTextStyle={messageStyle}
                    isEdited={hasBeenEdited}
                    shouldRenderJumboEmoji={shouldRenderJumboEmoji}
                    value={message}
                />
            );
        } else if (message.length) {
            messageComponent = (
                <View
                    style={[style.messageContainer, (isReplyPost && style.reply), (isPendingOrFailedPost && style.pendingPost)]}
                    onLayout={this.measurePost}
                    removeClippedSubviews={isLongPost}
                >
                    <Markdown
                        baseTextStyle={messageStyle}
                        blockStyles={blockStyles}
                        channelMentions={postProps.channel_mentions}
                        imagesMetadata={metadata?.images}
                        isEdited={hasBeenEdited}
                        isReplyPost={isReplyPost}
                        isSearchResult={isSearchResult}
                        onHashtagPress={onHashtagPress}
                        onPermalinkPress={onPermalinkPress}
                        onPostPress={onPress}
                        postId={post.id}
                        textStyles={textStyles}
                        value={message}
                        mentionKeys={mentionKeys}
                    />
                </View>
            );
        }

        const postContainerStyle = {...style.postContainerStyle};
        if (currentUserId === post.user_id) {
            postContainerStyle.backgroundColor = '#449aff99';
        } else {
            postContainerStyle.backgroundColor = '#5555D688';
        }
        if (mergeMessage) {
            postContainerStyle.borderTopStartRadius = 5;
        }
        if (!post.props?.reply_user_name && !commentedOnDisplayName) {
            postContainerStyle.paddingTop = 8;
        }

        if (!hasBeenDeleted) {
            body = (
                <View style={style.messageBody}>
                    <Swipeable
                        ref={this.swipeableRef}
                        renderLeftActions={leftActions}
                        onSwipeableLeftWillOpen={openReply}
                        friction={2}
                        overshootFriction={8}
                    >
                        <View style={postContainerStyle}>
                            {this.renderCommentedOnMessage()}
                            <ScrollView
                                style={{maxHeight: (showLongPost ? null : maxHeight), overflow: 'hidden'}}
                                scrollEnabled={false}
                                showsVerticalScrollIndicator={false}
                                showsHorizontalScrollIndicator={false}
                                keyboardShouldPersistTaps={'always'}
                            >
                                {messageComponent}
                            </ScrollView>
                            {isLongPost &&
                            <ShowMoreButton
                                highlight={highlight}
                                onPress={this.openLongPost}
                                theme={theme}
                            />
                            }
                        </View>
                    </Swipeable>
                    {this.renderPostAdditionalContent(blockStyles, messageStyle, textStyles)}
                    {this.renderFileAttachments()}
                    {this.renderReactions()}
                </View>
            );
        }

        return (
            <View style={style.messageContainerWithReplyBar}>
                <View style={replyBarStyle}/>
                {body}
                {isFailed &&
                <TouchableWithFeedback
                    onPress={onFailedPostPress}
                    style={style.retry}
                    type={'opacity'}
                >
                    <CompassIcon
                        name='information-outline'
                        size={26}
                        color={theme.errorTextColor}
                    />
                </TouchableWithFeedback>
                }
            </View>
        );
    }
}

const getStyleSheet = makeStyleSheetFromTheme((theme) => {
    return {
        messageBody: {
            paddingBottom: 2,
            paddingTop: 2,
            flex: 1,
        },
        commentedOnContainer: {
            borderBottomEndRadius: 5,
            borderBottomStartRadius: 5,
            marginBottom: 5,
            backgroundColor: '#fff3',
            borderTopEndRadius: 5,
            opacity: 1,
            padding: 5,
        },
        postContainerStyle: {
            borderBottomStartRadius: 5,
            borderBottomEndRadius: 5,
            borderTopEndRadius: 5,
            paddingHorizontal: 8,
            paddingBottom: 8,
            marginRight: 12,
        },
        messageContainer: {
            width: '100%',
        },
        reply: {
            paddingRight: 10,
        },
        retry: {
            justifyContent: 'center',
            marginLeft: 10,
        },
        message: {
            color: theme.centerChannelColor,
            fontSize: 15,
            lineHeight: 20,
        },
        messageContainerWithReplyBar: {
            flexDirection: 'row',
            width: '100%',
        },
        pendingPost: {
            opacity: 0.5,
        },
        systemMessage: {
            opacity: 0.6,
        },
    };
});
