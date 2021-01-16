// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getCurrentChannel} from '@mm-redux/selectors/entities/channels';
import ChannelLinkShare from './channel_link_share';
import {Client4} from '@mm-redux/client';

function mapStateToProps(state) {
    const currentChannel = getCurrentChannel(state);
    const channelUrl = Client4.getChannelRoute(currentChannel?.id);
    return {
        channelUrl,
        currentChannel,
    };
}

export default connect(mapStateToProps)(ChannelLinkShare);