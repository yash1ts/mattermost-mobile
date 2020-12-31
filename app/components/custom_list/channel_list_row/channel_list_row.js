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
                <View style={style.container}>
                    <View style={style.titleContainer}>
                        <CompassIcon
                            name={this.props.isArchived ? 'archive-outline' : 'globe'}
                            style={style.icon}
                        />
                        <Text style={style.displayName}>
                            {this.props.channel.display_name}
                        </Text>
                    </View>
                    <View style={style.detailContainer}>
                        <Text style={style.displayStats}>
                            {this.props.channelStats ? this.props.channelStats.member_count : 1}
                        </Text>
                        <CompassIcon
                            name={'account-multiple-outline'}
                            style={style.icon}
                        />

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
            alignItems: 'center',
            flexDirection: 'row',
            marginLeft: 16,
            marginTop: 2,
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
        },
        icon: {
            fontSize: 14,
            color: theme.centerChannelColor,
        },
        container: {
            flex: 1,
            flexDirection: 'column',
            paddingHorizontal: 15,
        },
        purpose: {
            marginTop: 7,
            fontSize: 13,
            color: changeOpacity(theme.centerChannelColor, 0.5),
        },
    };
});
