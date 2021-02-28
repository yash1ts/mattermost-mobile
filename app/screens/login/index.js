// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {login} from '@actions/views/user';
import {scheduleExpiredNotification} from '@actions/views/session';
import {getTheme} from '@mm-redux/selectors/entities/preferences';
import {getConfig, getLicense} from '@mm-redux/selectors/entities/general';
import Login from './login.js';
import {clearErrors} from '@mm-redux/actions/errors';

function mapStateToProps(state) {
    const config = getConfig(state);
    const license = getLicense(state);
    return {
        ...state.views.login,
        config,
        license,
        theme: getTheme(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            scheduleExpiredNotification,
            login,
            clearErrors,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
