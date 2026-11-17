<?php

require_api( 'authentication_api.php' );
require_api( 'form_api.php' );
require_api( 'helper_api.php' );

auth_reauthenticate();
access_ensure_global_level( config_get( 'manage_plugin_threshold' ) );

$t_enabled       = plugin_config_get( 'enabled' );
$t_contrast_type = plugin_config_get( 'contrast_type' );

if( gpc_get_string( 'action', '' ) === 'save' ) {
	form_security_validate( 'plugin_ModoDaltonico_config' );

	$t_new_enabled       = gpc_get_int( 'enabled', ON );
	$t_new_contrast_type = gpc_get_string( 'contrast_type', 'protanopia' );

	$t_valid_types = array( 'protanopia', 'deuteranopia', 'tritanopia' );
	if( !in_array( $t_new_contrast_type, $t_valid_types ) ) {
		$t_new_contrast_type = 'protanopia';
	}

	plugin_config_set( 'enabled', $t_new_enabled );
	plugin_config_set( 'contrast_type', $t_new_contrast_type );

	form_security_purge( 'plugin_ModoDaltonico_config' );
	print_header_redirect( plugin_page( 'config', true ) );
}

layout_page_header( plugin_lang_get( 'name' ) );
layout_page_begin();

?>

<div class="col-md-12 col-xs-12">
	<div class="space-10"></div>
	<div class="widget-box widget-color-blue2">
		<div class="widget-header widget-header-small">
			<h4 class="widget-title lighter">
				<?php print_icon( 'fa-universal-access', 'ace-icon' ); ?>
				<?php echo string_display( plugin_lang_get( 'configuracion' ) ); ?>
			</h4>
		</div>
		<div class="widget-body">
			<div class="widget-main no-padding">
				<form method="post" action="<?php echo string_attribute( plugin_page( 'config' ) ); ?>">
					<input type="hidden" name="action" value="save" />
					<?php echo form_security_field( 'plugin_ModoDaltonico_config' ); ?>

					<table class="table table-bordered table-condensed table-striped">
						<tr>
							<th class="category" width="30%">
								<?php echo string_display( plugin_lang_get( 'activar' ) ); ?> / <?php echo string_display( plugin_lang_get( 'desactivar' ) ); ?>
							</th>
							<td>
								<label>
									<input type="radio" name="enabled" value="1"
										<?php echo ( ON == $t_enabled ) ? 'checked="checked"' : ''; ?> />
									<?php echo string_display( plugin_lang_get( 'activado' ) ); ?>
								</label>
								<br />
								<label>
									<input type="radio" name="enabled" value="0"
										<?php echo ( OFF == $t_enabled ) ? 'checked="checked"' : ''; ?> />
									<?php echo string_display( plugin_lang_get( 'desactivado' ) ); ?>
								</label>
							</td>
						</tr>
						<tr>
							<th class="category">
								<?php echo string_display( plugin_lang_get( 'contrast_type' ) ); ?>
							</th>
							<td>
								<select name="contrast_type" class="input-sm">
									<option value="protanopia" <?php echo ( 'protanopia' === $t_contrast_type ) ? 'selected="selected"' : ''; ?>>
										<?php echo string_display( plugin_lang_get( 'protanopia' ) ); ?>
									</option>
									<option value="deuteranopia" <?php echo ( 'deuteranopia' === $t_contrast_type ) ? 'selected="selected"' : ''; ?>>
										<?php echo string_display( plugin_lang_get( 'deuteranopia' ) ); ?>
									</option>
									<option value="tritanopia" <?php echo ( 'tritanopia' === $t_contrast_type ) ? 'selected="selected"' : ''; ?>>
										<?php echo string_display( plugin_lang_get( 'tritanopia' ) ); ?>
									</option>
								</select>
							</td>
						</tr>
					</table>

					<div class="widget-toolbox padding-8 clearfix">
						<input type="submit" class="btn btn-primary btn-white btn-round"
							value="<?php echo string_attribute( plugin_lang_get( 'guardar' ) ); ?>" />
					</div>
				</form>
			</div>
		</div>
	</div>
</div>

<?php

layout_page_end();
