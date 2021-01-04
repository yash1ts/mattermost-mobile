// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {
    Platform,
    Text,
} from 'react-native';

import Emoji from 'app/components/emoji';
import TouchableWithFeedback from 'app/components/touchable_with_feedback';
import {changeOpacity, makeStyleSheetFromTheme} from 'app/utils/theme';
import {formatReactionValue} from '@utils/reaction';

export default class Reaction extends PureComponent {
    static propTypes = {
        count: PropTypes.number.isRequired,
        emojiName: PropTypes.string.isRequired,
        highlight: PropTypes.bool.isRequired,
        onPress: PropTypes.func.isRequired,
        onLongPress: PropTypes.func.isRequired,
        theme: PropTypes.object.isRequired,
    }

    handlePress = () => {
        const {emojiName, highlight, onPress} = this.props;
        onPress(emojiName, highlight);
    }

    render() {
        const {
            count,
            emojiName,
            highlight,
            onLongPress,
            theme,
        } = this.props;
        const styles = getStyleSheet(theme);

        return (
            <TouchableWithFeedback
                onPress={this.handlePress}
                onLongPress={onLongPress}
                delayLongPress={350}
                style={[styles.reaction, (highlight && styles.highlight)]}
                type={'opacity'}
            >
                <Emoji
                    emojiName={emojiName}
                    size={20}
                    textStyle={{color: 'black', fontWeight: 'bold'}}
                    customEmojiStyle={{marginHorizontal: 3}}
                    padding={5}
                />
                <Text style={styles.count}>{formatReactionValue(count)}</Text>
            </TouchableWithFeedback>
        );
    }
}

const getStyleSheet = makeStyleSheetFromTheme((theme) => {
    return {
        count: {
            color: theme.linkColor,
            marginLeft: 6,
        },
        highlight: {
            backgroundColor: changeOpacity(theme.linkColor, 0.1),
        },
        reaction: {
            alignItems: 'center',
            borderRadius: 2,
            borderColor: changeOpacity(theme.linkColor, 0.4),
            borderWidth: 1,
            flexDirection: 'row',
            height: 30,
            marginRight: 6,
            marginBottom: 5,
            marginTop: 10,
            paddingHorizontal: 6,
            ...Platform.select({
                android: {
                    paddingBottom: 2,
                },
            }),
        },
    };
});
