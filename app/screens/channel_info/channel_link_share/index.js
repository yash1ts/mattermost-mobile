// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getCurrentChannel} from '@mm-redux/selectors/entities/channels';
import ChannelLinkShare from './channel_link_share';
import {getCurrentTeamUrl} from '@mm-redux/selectors/entities/teams';

function mapStateToProps(state) {
    const currentChannel = getCurrentChannel(state);
    const channelUrl = `${getCurrentTeamUrl(state)}/communities/${currentChannel.name}`;
    return {
        channelUrl,
        currentChannel,
    };
}

export default connect(mapStateToProps)(ChannelLinkShare);
