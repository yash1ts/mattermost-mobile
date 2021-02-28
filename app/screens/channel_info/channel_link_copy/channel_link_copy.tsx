// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import {intlShape} from 'react-intl';

import {Theme} from '@mm-redux/types/preferences';
import ChannelInfoRow from '@screens/channel_info/channel_info_row';
import Separator from '@screens/channel_info/separator';
import {t} from '@utils/i18n';
import {preventDoubleTap} from '@utils/tap';
import {Platform, ToastAndroid} from 'react-native';
import Clipboard from '@react-native-community/clipboard';
interface ChannelLinkProps {
    testID?: string;
    channelUrl:string;
    theme: Theme;
}

export default class ChannelLinkCopy extends PureComponent<ChannelLinkProps> {
    static contextTypes = {
        intl: intlShape.isRequired,
    };

    copy = preventDoubleTap(() => {
        Clipboard.setString(this.props.channelUrl);
        if (Platform.OS === 'android') {
            ToastAndroid.show('Copied', ToastAndroid.SHORT);
        }
    });

    render() {
        const {testID, theme} = this.props;
        return (
            <>
                <Separator theme={theme}/>
                <ChannelInfoRow
                    testID={testID}
                    action={this.copy}
                    defaultMessage='Copy Channel Link'
                    icon='content-copy'
                    textId={t('channel_header.copy')}
                    theme={theme}
                />
            </>
        );
    }
}
