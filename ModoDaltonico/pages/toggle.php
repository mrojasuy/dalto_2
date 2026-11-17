<?php

require_api( 'authentication_api.php' );
require_api( 'form_api.php' );

auth_ensure_user_authenticated();

header( 'Content-Type: application/json; charset=utf-8' );

$t_result = array( 'ok' => false );

$t_active = gpc_get_string( 'active', '' );

if( $t_active === 'on' || $t_active === 'off' ) {
	$t_result['ok'] = true;
	$t_result['active'] = ( $t_active === 'on' );
} else {
	$t_result['error'] = 'Invalid parameter';
}

echo json_encode( $t_result );
