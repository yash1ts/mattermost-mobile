// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {PureComponent} from 'react';
import {TextInput, View, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import {GlobalStyles} from 'app/styles';
import CompassIcon from '@components/compass_icon';

export default class InputPassword extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            showPassword: false,
        };
    }

    static propTypes = {
        placeholder: PropTypes.string,
        onSubmitEditing: PropTypes.func,
        placeholderTextColor: PropTypes.string,
        returnKeyType: PropTypes.string,
        underlineColorAndroid: PropTypes.string,
        disableFullscreenUI: PropTypes.bool,
        onChangeText: PropTypes.func,
        reference: PropTypes.object,
    };

    onViewPress = () => {
        this.setState((state) => {
            return {showPassword: !state.showPassword};
        });
    }

    render() {
        return (
            <View style={{alignSelf: 'stretch'}}>
                <TextInput
                    ref={this.props.reference}
                    secureTextEntry={!this.state.showPassword}
                    autoCapitalize='none'
                    autoCorrect={false}
                    disableFullscreenUI={this.props.disableFullscreenUI}
                    keyboardType='name-phone-pad'
                    onChangeText={this.props.onChangeText}
                    onSubmitEditing={this.props.onSubmitEditing}
                    placeholder={this.props.placeholder}
                    placeholderTextColor={this.props.placeholderTextColor}
                    returnKeyType={this.props.returnKeyType}
                    style={GlobalStyles.inputBox}
                    underlineColorAndroid={this.props.underlineColorAndroid}
                />
                <TouchableOpacity
                    style={{position: 'absolute', right: 15, bottom: '32%'}}
                    onPress={this.onViewPress}
                >
                    <CompassIcon
                        name='eye-outline'
                        size={20}
                        color='#fff'
                    />
                </TouchableOpacity>
            </View>
        );
    }
}
