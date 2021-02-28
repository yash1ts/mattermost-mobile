// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {
    Text,
} from 'react-native';
import CompassIcon from '@components/compass_icon';
import {View} from 'react-native-animatable';
import {makeStyleSheetFromTheme} from '@utils/theme';
import {TouchableOpacity} from 'react-native-gesture-handler';

export default class ReplyPopup extends PureComponent {
    static propTypes = {
        theme: PropTypes.object.isRequired,
        replyPopup: PropTypes.object.isRequired,
<<<<<<< HEAD
        closeReplyPopup: PropTypes.func.isRequired,
=======
        closeReplyPopup: PropTypes.object.isRequired,
>>>>>>> 66e35a8a74d7b6378443c760b3d1dd9d0c41d838
    };

    renderPopup = (style, replyPopup) => {
        if (!replyPopup.user_name) {
            return null;
        }
        return (<View style={[style.replyContainer, {bottom: -4}]}>
            <View style={style.replyHeader}>
                <Text style={style.replyText}>{replyPopup.user_name + ':'} </Text>
                <TouchableOpacity
                    onPress={this.props.closeReplyPopup}
                >
                    <CompassIcon
                        name='close'
                        color='grey'
                        style={style.closeButton}
                    />
                </TouchableOpacity>
            </View>
            <Text style={style.replyText}>{replyPopup.message}</Text>
        </View>);
    };

    render() {
        const style = getStyleSheet(this.props.theme);
        const {replyPopup} = this.props;

        return (
            <View>
                {this.renderPopup(style, replyPopup)}
            </View>
        );
    }
}

const getStyleSheet = makeStyleSheetFromTheme((theme) => {
    return {
        replyHeader: {
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        replyText: {
            color: 'grey',
        },
        replyContainer: {
            flex: 1,
            backgroundColor: theme.centerChannelBg,
            borderWidth: 2,
            borderColor: theme.sidebarHeaderBg,
            borderRadius: 5,
            position: 'absolute',
            left: 8,
            right: 8,
            zIndex: 2,
            paddingHorizontal: 10,
            paddingVertical: 8,
        },
        closeButton: {
            alignSelf: 'flex-end', fontSize: 16,
        },
    };
});

