// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import {Alert} from 'react-native';
import {intlShape} from 'react-intl';

import {ActionResult} from '@mm-redux/types/actions';
import {Channel} from '@mm-redux/types/channels';
import {FormattedMsg} from '@mm-redux/types/general';
import {Theme} from '@mm-redux/types/preferences';
import ChannelInfoRow from '@screens/channel_info/channel_info_row';
import Separator from '@screens/channel_info/separator';
import {t} from '@utils/i18n';
import {preventDoubleTap} from '@utils/tap';

interface BlockProps {
    canLeave: boolean;
    currentChannel: Channel;
    displayName: string;
<<<<<<< HEAD
=======
    leaveChannel: (channel: Channel, reset: boolean) => Promise<ActionResult>;
>>>>>>> 66e35a8a74d7b6378443c760b3d1dd9d0c41d838
    blockDMChannel: (channel: Channel) => Promise<ActionResult>;
    unblockDMChannel: (channel: Channel) => Promise<ActionResult>;
    isDirectMessage: boolean;
    isFavorite: boolean;
    isGroupMessage: boolean;
    isPublic: boolean;
    isBlockedByMe: boolean;
    isBlockedByOther:boolean;
    theme: Theme;
}

export default class Block extends PureComponent<BlockProps> {
    static contextTypes = {
        intl: intlShape.isRequired,
    };

    alertAndHandleYesAction = (title: FormattedMsg, message: FormattedMsg, onPressAction: () => void) => {
        const {formatMessage} = this.context.intl;
        const {displayName} = this.props;

        // eslint-disable-next-line multiline-ternary
        const term = 'Direct Message';

        Alert.alert(
            formatMessage(title, {term}),
            formatMessage(
                message,
                {
                    term: term.toLowerCase(),
                    name: displayName,
                },
            ),
            [{
                text: formatMessage({id: 'mobile.channel_info.alertNo', defaultMessage: 'No'}),
            }, {
                text: formatMessage({id: 'mobile.channel_info.alertYes', defaultMessage: 'Yes'}),
                onPress: onPressAction,
            }],
        );
    }

    handleBlock = preventDoubleTap(() => {
        const title = {id: t('mobile.channel_info.alertTitleBlockChannel'), defaultMessage: 'Block Direct Message'};
        const message = {
            id: t('mobile.channel_info.alertMessageBlockChannel'),
<<<<<<< HEAD
            defaultMessage: 'Are you sure you want to block {name}?',
=======
            defaultMessage: 'Are you sure you want to block the this Direct Message?',
>>>>>>> 66e35a8a74d7b6378443c760b3d1dd9d0c41d838
        };
        const onPressAction = () => {
            this.props.blockDMChannel(this.props.currentChannel);
        };
        this.alertAndHandleYesAction(title, message, onPressAction);
    });

    handleUnblock = preventDoubleTap(() => {
        const title = {id: t('mobile.channel_info.alertTitleUnblockChannel'), defaultMessage: 'Unblock Direct Message'};
        const message = {
<<<<<<< HEAD
            id: t('mobile.channel_info.alertMessageUnBlockChannel'),
            defaultMessage: 'Are you sure you want to unblock {name}?',
=======
            id: t('mobile.channel_info.alertMessageLeaveChannel'),
            defaultMessage: 'Are you sure you want to unblock the Direct Message?',
>>>>>>> 66e35a8a74d7b6378443c760b3d1dd9d0c41d838
        };
        const onPressAction = () => {
            this.props.unblockDMChannel(this.props.currentChannel);
        };
        this.alertAndHandleYesAction(title, message, onPressAction);
    });

    render() {
        const {canLeave, isDirectMessage, isGroupMessage, theme, isBlockedByMe} = this.props;

        if (!canLeave && !isDirectMessage && !isGroupMessage) {
            return null;
        }

        let element;
        if (isBlockedByMe) {
            const i18nId = t('mobile.channel_list.unblockDM');
            const defaultMessage = 'Unblock Direct Message';

            element = (
                <ChannelInfoRow
                    action={this.handleUnblock}
                    defaultMessage={defaultMessage}
                    icon='close'
                    iconColor='#CA3B27'
                    textColor='#CA3B27'
                    textId={i18nId}
                    theme={theme}
                    rightArrow={false}
                />
            );
        } else {
            element = (
                <ChannelInfoRow
                    action={this.handleBlock}
                    defaultMessage='Block Direct Message'
                    icon='close'
                    iconColor='#CA3B27'
                    textColor='#CA3B27'
                    textId={t('navbar.block')}
                    theme={theme}
                    rightArrow={false}
                />
            );
        }

        return (
            <>
                <Separator theme={theme}/>
                {element}
            </>
        );
    }
}
