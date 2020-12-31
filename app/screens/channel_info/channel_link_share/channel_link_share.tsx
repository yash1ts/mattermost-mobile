// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import {intlShape} from 'react-intl';

import {Theme} from '@mm-redux/types/preferences';
import ChannelInfoRow from '@screens/channel_info/channel_info_row';
import Separator from '@screens/channel_info/separator';
import {t} from '@utils/i18n';
import {preventDoubleTap} from '@utils/tap';
import {General} from '@mm-redux/constants';
import {Alert, Share} from 'react-native';
interface ChannelLinkProps {
    testID?: string;
    channelUrl:string;
    currentChannel:any;
    theme: Theme;
}

export default class ChannelLinkShare extends PureComponent<ChannelLinkProps> {
    static contextTypes = {
        intl: intlShape.isRequired,
    };
    shareLink = preventDoubleTap(async () => {
        const share = {
            url: this.props.channelUrl,
            message: 'Hey I found a great Community on Tupp.\n' + this.props.channelUrl,
        };

        try {
            const result = await Share.share(share);
            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                } else {
                    // shared
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }
        } catch (error) {
            Alert.alert(error.message);
        }
    });
    render() {
        const {currentChannel, testID, theme} = this.props;
        if (currentChannel?.type === General.OPEN_CHANNEL) {
            return (
                <>
                    <Separator theme={theme}/>
                    <ChannelInfoRow
                        testID={testID}
                        action={this.shareLink}
                        defaultMessage='Share Channel'
                        icon='reply-outline'
                        textId={t('channel_header.share')}
                        theme={theme}
                    />
                </>
            );
        }

        return null;
    }
}
