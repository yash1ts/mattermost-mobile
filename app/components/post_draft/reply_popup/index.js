// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import ReplyPopup from '../reply_popup';

function mapStateToProps(state) {
    const replyPopup = state.entities?.replyPopup;

    return {
        replyPopup,
    };
}

export default connect(mapStateToProps)(ReplyPopup);
