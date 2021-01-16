// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {
    View,
    ViewPropTypes,
} from 'react-native';

import RecentDate from 'app/components/recent_date';
import {makeStyleSheetFromTheme} from 'app/utils/theme';
import { changeOpacity } from '@mm-redux/utils/theme_utils';

// DateHeader accepts as a timestamp for rendering as part of a post list.
export default class DateHeader extends PureComponent {
    static propTypes = {
        date: PropTypes.number.isRequired,
        theme: PropTypes.object.isRequired,
        timeZone: PropTypes.string,
        style: ViewPropTypes.style,
    };

    render() {
        const {theme, timeZone, date} = this.props;
        const style = getStyleSheet(theme);

        return (
            <View style={[style.container, this.props.style]}>
                <View style={style.line}/>
                <View style={style.dateContainer}>
                    <RecentDate
                        style={style.date}
                        timeZone={timeZone}
                        value={date}
                    />
                </View>
                <View style={style.line}/>
            </View>
        );
    }
}

const getStyleSheet = makeStyleSheetFromTheme((theme) => {
    return {
        container: {
            alignItems: 'center',
            flexDirection: 'row',
            height: 28,
            marginTop: 8,
        },
        dateContainer: {
            marginHorizontal: 15,
            backgroundColor: theme.sidebarHeaderBg,
            padding: 8,
            borderRadius: 5,
        },
        line: {
            flex: 1,
            height: 1,
            backgroundColor: theme.centerChannelColor,
            opacity: 0.2,
        },
        date: {
            color: changeOpacity('#fafafa', 0.8),
            fontSize: 14,
            fontWeight: '600',
        },
    };
});
