// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {
    Text,
    View,
} from 'react-native';

import CompassIcon from '@components/compass_icon';
import CustomListRow from '@components/custom_list/custom_list_row';
import {makeStyleSheetFromTheme, changeOpacity} from '@utils/theme';
import {formatReactionValue} from '@utils/reaction';

export default class ChannelListRow extends React.PureComponent {
    static propTypes = {
        id: PropTypes.string.isRequired,
        isArchived: PropTypes.bool,
        theme: PropTypes.object.isRequired,
        channel: PropTypes.object.isRequired,
        ...CustomListRow.propTypes,
    };

    onPress = () => {
        this.props.onPress(this.props.id, this.props.item);
    };

    render() {
        const style = getStyleFromTheme(this.props.theme);
        const {channelStats, isArchived, channel} = this.props;
        let purpose;
        if (this.props.channel.purpose) {
            purpose = (
                <Text
                    style={style.purpose}
                    ellipsizeMode='tail'
                    numberOfLines={1}
                >
                    {this.props.channel.purpose}
                </Text>
            );
        }
        return (
            <CustomListRow
                id={this.props.id}
                onPress={this.props.onPress ? this.onPress : null}
                enabled={this.props.enabled}
                selectable={this.props.selectable}
                selected={this.props.selected}
            >
                <View style={{flexDirection: 'column', paddingLeft: 15, flex: 1}}>
                    <View style={style.container}>
                        <View style={style.titleContainer}>
                            <CompassIcon
                                name={isArchived ? 'archive-outline' : 'radiobox-marked'}
                                style={style.icon}
                            />
                            <Text style={style.displayName}>
                                {channel.display_name}
                            </Text>
                        </View>
                        <View style={style.detailContainer}>
                            <CompassIcon
                                name={'account-multiple-outline'}
                                style={style.icon}
                            />
                            <Text style={style.displayStats}>
                                {channelStats ? formatReactionValue(channelStats.member_count) : 1}
                            </Text>
                            <CompassIcon
                                name={'message-text-outline'}
                                style={style.icon}
                            />
                            {channel &&
                                <Text style={style.displayStats}>
                                    {formatReactionValue(channel.total_msg_count)}
                                </Text>}
                        </View>
                    </View>
                    {purpose}
                </View>
            </CustomListRow>
        );
    }
}

const getStyleFromTheme = makeStyleSheetFromTheme((theme) => {
    return {
        titleContainer: {
            alignItems: 'center',
            flexDirection: 'row',
        },
        detailContainer: {
            flexDirection: 'row',
            marginTop: 2,
            alignItems: 'center',

        },
        displayName: {
            fontSize: 16,
            color: theme.centerChannelColor,
            marginLeft: 5,

        },
        displayStats: {
            marginHorizontal: 10,
            color: changeOpacity(theme.centerChannelColor, 0.5),
            fontSize: 15,
            width: 32,
        },
        icon: {
            fontSize: 14,
            color: theme.centerChannelColor,
        },
        container: {
            flexDirection: 'row',
            flex: 1,
            justifyContent: 'space-between',
        },
        purpose: {
            marginTop: 10,
            fontSize: 13,
            color: changeOpacity(theme.centerChannelColor, 0.6),
        },
    };
});
