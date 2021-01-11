// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';

import CompassIcon from '@components/compass_icon';
import TouchableWithFeedback from '@components/touchable_with_feedback';
import {changeOpacity} from '@utils/theme';

function SendButton(props) {
    const {testID, theme} = props;
    const sendButtonTestID = `${testID}.send.button`;
    const sendButtonDisabledTestID = `${testID}.send.button.disabled`;

    if (props.disabled) {
        return (
            <View
                testID={sendButtonDisabledTestID}
                style={style.sendButtonContainer}
            >
                <CompassIcon
                    name='send'
                    size={32}
                    color={changeOpacity(theme.buttonColor, 0.2)}
                />
            </View>
        );
    }

    return (
        <TouchableWithFeedback
            testID={sendButtonTestID}
            onPress={props.handleSendMessage}
            style={style.sendButtonContainer}
            type={'opacity'}
        >
            <CompassIcon
                name='send'
                size={32}
                color={theme.buttonColor}
            />
        </TouchableWithFeedback>
    );
}

SendButton.propTypes = {
    testID: PropTypes.string,
    handleSendMessage: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired,
    theme: PropTypes.object.isRequired,
};

const style = {
    disableButton: {

        // backgroundColor: changeOpacity('#fff', 0.3),
    },
    sendButtonContainer: {
        justifyContent: 'flex-end',
        paddingRight: 16,
    },
    sendButton: {
        borderRadius: 4,
        height: 32,
        width: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
};

export default memo(SendButton);
