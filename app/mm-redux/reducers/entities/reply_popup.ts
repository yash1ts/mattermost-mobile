// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {GenericAction} from '@mm-redux/types/actions';
import {ReplyPopup} from '@mm-redux/types/reply_popup';
import ReplyAction from '@mm-redux/action_types/channels';

const initial = {
    message: '',
    user_name: '',
    root_id: '',
};

export default function replyPopup(state:ReplyPopup = initial, action:GenericAction) {
    if (action.type === ReplyAction.POPUP_REPLY) {
        return {...action.data};
    }
    return state;
}
