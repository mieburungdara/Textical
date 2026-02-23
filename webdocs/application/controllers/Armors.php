<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Armors extends CI_Controller {

    public function __construct() {
        parent::__construct();
        $this->load->model('Armor_model');
    }

    /**
     * Armor index page.
     */
    public function index() {
        $data['armors'] = $this->Armor_model->get_all_armors();
        $data['slot_categories'] = $this->Armor_model->get_slot_categories();
        $data['title'] = "Armor Database";

        $this->load->view('templates/header', $data);
        $this->load->view('templates/sidebar', $data);
        $this->load->view('armors/index', $data);
        $this->load->view('templates/footer', $data);
    }
}
