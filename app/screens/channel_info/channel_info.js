// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {intlShape} from 'react-intl';
import {
    ScrollView,
    View,
} from 'react-native';
import {Navigation} from 'react-native-navigation';
import {SafeAreaView} from 'react-native-safe-area-context';

import {dismissModal} from '@actions/navigation';
import StatusBar from '@components/status_bar';
import {alertErrorWithFallback} from '@utils/general';
import {t} from '@utils/i18n';
import {changeOpacity, makeStyleSheetFromTheme} from '@utils/theme';

import AddMembers from './add_members';
import NotificationPreference from './notification_preference';
import ChannelInfoHeader from './channel_info_header';
import ConvertPrivate from './convert_private';
import EditChannel from './edit_channel';
import Favorite from './favorite';
import IgnoreMentions from './ignore_mentions';
import Leave from './leave';
import ManageMembers from './manage_members';
import Mute from './mute';
import Pinned from './pinned';
import Separator from './separator';
import ChannelLinkShare from './channel_link_share';
import ChannelLinkCopy from './channel_link_copy';
import Block from './block';
<<<<<<< HEAD
import {General} from '@mm-redux/constants';
=======
>>>>>>> 66e35a8a74d7b6378443c760b3d1dd9d0c41d838

export default class ChannelInfo extends PureComponent {
    static propTypes = {
        actions: PropTypes.shape({
            getChannelStats: PropTypes.func.isRequired,
            getCustomEmojisInText: PropTypes.func.isRequired,
            setChannelDisplayName: PropTypes.func.isRequired,
            showPermalink: PropTypes.func.isRequired,
        }),
        currentChannel: PropTypes.object.isRequired,
        currentChannelCreatorName: PropTypes.string,
        currentChannelGuestCount: PropTypes.number,
        currentChannelMemberCount: PropTypes.number,
        currentUserId: PropTypes.string,
        isBot: PropTypes.bool.isRequired,
        isLandscape: PropTypes.bool.isRequired,
        isTeammateGuest: PropTypes.bool.isRequired,
        isDirectMessage: PropTypes.bool.isRequired,
        status: PropTypes.string,
        theme: PropTypes.object.isRequired,
        isBlockedByOther: PropTypes.bool,
        isBlockedByMe: PropTypes.bool,
<<<<<<< HEAD
        isChannelAdmin: PropTypes.bool,
=======
>>>>>>> 66e35a8a74d7b6378443c760b3d1dd9d0c41d838
    };

    static defaultProps = {
        currentChannelGuestCount: 0,
    }

    static contextTypes = {
        intl: intlShape.isRequired,
    };

    componentDidMount() {
        this.navigationEventListener = Navigation.events().bindComponent(this);
        this.props.actions.getChannelStats(this.props.currentChannel.id);
        this.props.actions.getCustomEmojisInText(this.props.currentChannel.header);
    }

    navigationButtonPressed({buttonId}) {
        if (buttonId === 'close-info') {
            dismissModal();
        }
    }

    close = (redirect = true) => {
        const {actions} = this.props;

        if (redirect) {
            actions.setChannelDisplayName('');
        }

        dismissModal();
    };

    handlePermalinkPress = (postId, teamName) => {
        this.props.actions.showPermalink(this.context.intl, teamName, postId);
    };

    permalinkBadTeam = () => {
        const {intl} = this.context;
        const message = {
            id: t('mobile.server_link.unreachable_team.error'),
            defaultMessage: 'This link belongs to a deleted team or to a team to which you do not have access.',
        };

        alertErrorWithFallback(intl, {}, message);
    };

    actionsRows = (channelIsArchived) => {
        const {currentChannel, currentUserId, isDirectMessage, theme, isChannelAdmin} = this.props;
        const isPublic = currentChannel?.type === General.OPEN_CHANNEL;

        if (channelIsArchived) {
            return (
                <ManageMembers
                    theme={theme}
                    separator={false}
                />);
        }

        return (
            <>
                <Favorite
                    testID='channel_info.favorite.action'
                    channelId={currentChannel.id}
                    theme={theme}
                />
                <Separator theme={theme}/>
                <Mute
                    testID='channel_info.mute.action'
                    channelId={currentChannel.id}
                    userId={currentUserId}
                    theme={theme}
                />
                <Separator theme={theme}/>
                <IgnoreMentions
                    testID='channel_info.ignore_mentions.action'
                    channelId={currentChannel.id}
                    theme={theme}
                />
                <Separator theme={theme}/>
                {!isDirectMessage &&
                <>
                    <NotificationPreference
                        testID='channel_info.notification_preference.action'
                        theme={theme}
                    />
                    <Separator theme={theme}/>
                </>
                }
                <Pinned
                    testID='channel_info.pinned_messages.action'
                    channelId={currentChannel.id}
                    theme={theme}
                />
                <ManageMembers
                    testID='channel_info.manage_members.action'
                    theme={theme}
                />
                <AddMembers
                    testID='channel_info.add_members.action'
                    theme={theme}
                />
<<<<<<< HEAD
                { isChannelAdmin &&
                    <ConvertPrivate
                        testID='channel_info.convert_private.action'
                        theme={theme}
                    />
                }
                {!isDirectMessage && (isChannelAdmin) &&
                <EditChannel
                    testID='channel_info.edit_channel.action'
                    theme={theme}
                />
                }
                {(isPublic || isChannelAdmin) &&
=======
                <ConvertPrivate
                    testID='channel_info.convert_private.action'
                    theme={theme}
                />
                {!isDirectMessage &&
                <EditChannel
                    testID='channel_info.edit_channel.action'
                    theme={theme}
                />}
>>>>>>> 66e35a8a74d7b6378443c760b3d1dd9d0c41d838
                <ChannelLinkShare
                    testID='channel_info.edit_channel.action'
                    theme={theme}
                />
                }
                {(isPublic || isChannelAdmin) &&
                <ChannelLinkCopy
                    testID='channel_info.edit_channel.action'
                    theme={theme}
                />
                }
            </>
        );
    };

    render() {
        const {
            currentChannel,
            currentChannelCreatorName,
            currentChannelMemberCount,
            currentChannelGuestCount,
            status,
            theme,
            isBot,
            isTeammateGuest,
            isBlockedByMe,
            isBlockedByOther,
<<<<<<< HEAD
            isDirectMessage,
            isChannelAdmin,
=======
>>>>>>> 66e35a8a74d7b6378443c760b3d1dd9d0c41d838
        } = this.props;

        const style = getStyleSheet(theme);
        const channelIsArchived = currentChannel.delete_at !== 0;

        return (
            <SafeAreaView
                testID='channel_info.screen'
                style={style.container}
                edges={['bottom', 'left', 'right']}
            >
                <StatusBar/>
                <ScrollView
                    style={style.scrollView}
                >
                    {Boolean(currentChannel?.id) &&
                    <ChannelInfoHeader
                        createAt={currentChannel.create_at}
                        creator={currentChannelCreatorName}
                        displayName={currentChannel.display_name}
                        header={currentChannel.header}
                        memberCount={currentChannelMemberCount}
                        onPermalinkPress={this.handlePermalinkPress}
                        purpose={''}
                        status={status}
                        theme={theme}
                        type={currentChannel.type}
                        isArchived={channelIsArchived}
                        isBot={isBot}
                        isChannelAdmin={isChannelAdmin}
                        isTeammateGuest={isTeammateGuest}
                        hasGuests={currentChannelGuestCount > 0}
                        isGroupConstrained={currentChannel.group_constrained}
                    />
                    }
                    <View style={style.rowsContainer}>
                        {this.actionsRows(channelIsArchived)}
                    </View>
                    <View style={style.footer}>
                        {!isChannelAdmin &&
                        <Leave
                            close={this.close}
                            theme={theme}
                        />
<<<<<<< HEAD
                        }
                        {isDirectMessage &&
=======
>>>>>>> 66e35a8a74d7b6378443c760b3d1dd9d0c41d838
                        <Block
                            theme={theme}
                            isBlockedByMe={isBlockedByMe}
                            isBlockedByOther={isBlockedByOther}
                        />
<<<<<<< HEAD
                        }
=======
>>>>>>> 66e35a8a74d7b6378443c760b3d1dd9d0c41d838
                        {/* <Archive
                            close={this.close}
                            theme={theme}
                        /> */}
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }
}

const getStyleSheet = makeStyleSheetFromTheme((theme) => {
    return {
        container: {
            flex: 1,
        },
        scrollView: {
            flex: 1,
            backgroundColor: changeOpacity(theme.centerChannelColor, 0.03),
        },
        footer: {
            marginTop: 40,
            marginBottom: 10,
        },
        rowsContainer: {
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderTopColor: changeOpacity(theme.centerChannelColor, 0.1),
            borderBottomColor: changeOpacity(theme.centerChannelColor, 0.1),
            backgroundColor: theme.centerChannelBg,
        },
    };
});
