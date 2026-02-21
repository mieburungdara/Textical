<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Weapons extends CI_Controller {

    public function __construct() {
        parent::__construct();
        $this->load->model('Weapon_model');
    }

    /**
     * Main viewer page
     */
    public function index() {
        $data['weapons'] = $this->Weapon_model->get_all_weapons();
        $data['categories'] = $this->Weapon_model->get_weapon_categories();
        $data['all_types'] = $this->Weapon_model->get_all_types();
        $data['all_traits'] = $this->Weapon_model->get_all_traits();
        $data['title'] = "Weapon Database";
        
        $this->load->view('templates/header', $data);
        $this->load->view('templates/sidebar', $data);
        $this->load->view('weapons/index', $data);
        $this->load->view('templates/footer', $data);
    }

    /**
     * Update weapon data (AJAX)
     */
    public function update() {
        if ($this->input->is_ajax_request()) {
            $id = $this->input->post('id');
            
            $data = array(
                'name' => $this->input->post('name'),
                'description' => $this->input->post('description'),
                'rarity' => $this->input->post('rarity'),
                'baseValue' => (int)$this->input->post('baseValue'),
                'isTwoHanded' => (int)$this->input->post('isTwoHanded'),
                'weaponTypeId' => (int)$this->input->post('weaponTypeId'),
                'imageUrl' => $this->input->post('imageUrl')
            );
            
            $stats = $this->input->post('stats'); // Expecting associative array
            
            $traitId = $this->input->post('traitId');
            
            $success = $this->Weapon_model->update_weapon($id, $data, $stats, $traitId);

            // Sync to Master JSON for Seeder Persistence
            if ($success) {
                $this->_sync_master_json();
            }
            
            echo json_encode(array('success' => $success));
        }
    }

    /**
     * Persist current DB state to Master JSON for Seeder
     */
    private function _sync_master_json() {
        $data = $this->Weapon_model->get_master_data();
        $filePath = '../server/prisma/master_weapons.json';
        file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT));
    }

    /**
     * Export all weapons to JSON for the game client
     */
    public function export_json() {
        $data = $this->Weapon_model->get_export_data();
        
        // Ensure path exists
        $filePath = '../client/assets/data/weapons.json';
        $dir = dirname($filePath);
        if (!is_dir($dir)) {
            mkdir($dir, 0777, true);
        }

        $json = json_encode($data, JSON_PRETTY_PRINT);
        
        if (file_put_contents($filePath, $json)) {
            $this->session->set_flashdata('success', 'Successfully exported ' . count($data) . ' weapons to ' . $filePath);
        } else {
            $this->session->set_flashdata('error', 'Failed to write export file.');
        }

        redirect('weapons');
    }
}
