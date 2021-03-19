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

interface LeaveProps {
    canLeave: boolean;
    currentChannel: Channel;
    close: (redirect: boolean) => void;
    closeDMChannel: (channel: Channel) => Promise<ActionResult>;
    closeGMChannel: (channel: Channel) => Promise<ActionResult>;
    displayName: string;
    leaveChannel: (channel: Channel, reset: boolean) => Promise<ActionResult>;
    isDirectMessage: boolean;
    isFavorite: boolean;
    isGroupMessage: boolean;
    isPublic: boolean;
    theme: Theme;
}

export default class Leave extends PureComponent<LeaveProps> {
    static contextTypes = {
        intl: intlShape.isRequired,
    };

    alertAndHandleYesAction = (title: FormattedMsg, message: FormattedMsg, onPressAction: () => void) => {
        const {formatMessage} = this.context.intl;
        const {displayName, isPublic, isDirectMessage} = this.props;

        // eslint-disable-next-line multiline-ternary
        let term;
        if (isDirectMessage) {
            term = formatMessage({id: 'mobile.channel_info.directMessage', defaultMessage: 'Direct Message'});
        } else if (isPublic) {
            term = formatMessage({id: 'mobile.channel_info.publicChannel', defaultMessage: 'Public Channel'});
        } else {
            term = formatMessage({id: 'mobile.channel_info.privateChannel', defaultMessage: 'Private Channel'});
        }

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

    handleClose = preventDoubleTap(() => {
        const {close, currentChannel, isDirectMessage, isFavorite} = this.props;
        const channel = Object.assign({}, currentChannel, {isCurrent: true}, {isFavorite});
        const {closeDMChannel, closeGMChannel} = this.props;

        const title = {id: t('mobile.channel_info.alertTitleCloseChannel'), defaultMessage: 'Close {term}'};
        const message = {
            id: t('mobile.channel_info.alertMessageCloseChannel'),
            defaultMessage: 'Are you sure you want to close the {term}?',
        };

        const onPressAction = () => {
            if (isDirectMessage) {
                closeDMChannel(channel).then(() => {
                    close(true);
                });
            } else {
                closeGMChannel(channel).then(() => {
                    close(true);
                });
            }
        };

        this.alertAndHandleYesAction(title, message, onPressAction);
    });

    handleLeave = preventDoubleTap(() => {
        const title = {id: t('mobile.channel_info.alertTitleLeaveChannel'), defaultMessage: 'Leave {term}'};
        const message = {
            id: t('mobile.channel_info.alertMessageLeaveChannel'),
            defaultMessage: 'Are you sure you want to leave the {term} {name}?',
        };
        const onPressAction = () => {
            this.props.leaveChannel(this.props.currentChannel, true).then(() => {
                this.props.close(true);
            });
        };
        this.alertAndHandleYesAction(title, message, onPressAction);
    });

    render() {
        const {canLeave, isDirectMessage, isGroupMessage, theme} = this.props;

        if (!canLeave && !isDirectMessage && !isGroupMessage) {
            return null;
        }

        let element;
        if (isDirectMessage || isGroupMessage) {
            let i18nId;
            let defaultMessage;
            if (isDirectMessage) {
                i18nId = t('mobile.channel_list.closeDM');
                defaultMessage = 'Close Direct Message';
            } else {
                i18nId = t('mobile.channel_list.closeGM');
                defaultMessage = 'Close Group Message';
            }

            element = (
                <ChannelInfoRow
                    action={this.handleClose}
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
                    action={this.handleLeave}
                    defaultMessage='Leave Channel'
                    icon='exit-to-app'
                    iconColor='#CA3B27'
                    textColor='#CA3B27'
                    textId={t('navbar.leave')}
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
