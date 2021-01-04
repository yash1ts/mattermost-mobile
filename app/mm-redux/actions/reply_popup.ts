// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ReplyPopup} from '@mm-redux/types/reply_popup';
import ReplyAction from '@mm-redux/action_types/channels';

export function setReplyPopup(replyData:ReplyPopup) {
    return {
        type: ReplyAction.POPUP_REPLY,
        data: replyData,
    };
}
