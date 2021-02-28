// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Animated, View, Text} from 'react-native';

import KeyboardLayout from '@components/layout/keyboard_layout';
import Loading from '@components/loading';
import PostList from '@components/post_list';
import PostDraft from '@components/post_draft';
import SafeAreaView from '@components/safe_area_view';
import StatusBar from '@components/status_bar';
import {THREAD} from '@constants/screen';
import {changeOpacity, makeStyleSheetFromTheme} from '@utils/theme';

import ThreadBase from './thread_base';

export default class ThreadAndroid extends ThreadBase {
    render() {
        const {
            myMember,
            postIds,
            theme,
            highlightPostId,
            channelId,
            rootId,
            channelIsArchived,
        } = this.props;

        const {isBlockedByMe, isBlockedByOther} = this.props;
        let element;
        if ((!isBlockedByMe && !isBlockedByOther)) {
            element = (
                <PostDraft
                    testID='thread.post_draft'
                    ref={this.postDraft}
                    channelId={channelId}
                    channelIsArchived={channelIsArchived}
                    rootId={rootId}
                    screenId={this.props.componentId}
                    registerTypingAnimation={this.registerTypingAnimation}
                />
            );
        } else {
            const message = isBlockedByMe ? 'You have blocked this User' : 'You have been blocked by this User';
            element = (<View style={{marginVertical: 10}}>
                <View style={{backgroundColor: theme.sidebarHeaderBg, borderRadius: 5, alignSelf: 'center'}}>
                    <Text style={{color: '#fffa', padding: 8}}>{message}</Text>
                </View>
            </View>);
        }

        let content;
        if (this.hasRootPost()) {
            content = (
                <>
                    <Animated.View
                        testID='thread.screen'
                        style={{flex: 1, paddingBottom: this.bottomPadding}}
                    >
                        <PostList
                            testID='thread.post_list'
                            renderFooter={this.renderFooter()}
                            indicateNewMessages={false}
                            postIds={postIds}
                            currentUserId={myMember && myMember.user_id}
                            lastViewedAt={this.state.lastViewedAt}
                            lastPostIndex={-1}
                            highlightPostId={highlightPostId}
                            onPostPress={this.hideKeyboard}
                            location={THREAD}
                        />
                    </Animated.View>
                    {element}
                </>
            );
        } else {
            content = (
                <Loading color={theme.centerChannelColor}/>
            );
        }

        const style = getStyleSheet(theme);
        return (
            <SafeAreaView>
                <StatusBar/>
                <KeyboardLayout>
                    <View style={style.separator}/>
                    {content}
                </KeyboardLayout>
            </SafeAreaView>
        );
    }
}

const getStyleSheet = makeStyleSheetFromTheme((theme) => ({
    separator: {
        backgroundColor: changeOpacity(theme.centerChannelColor, 0.2),
        height: 1,
    },
}));
