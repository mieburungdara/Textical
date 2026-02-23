<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Traits extends CI_Controller {

    public function __construct() {
        parent::__construct();
        $this->load->model('Trait_model');
    }

    /**
     * Traits index page.
     */
    public function index() {
        $data['traits'] = $this->Trait_model->get_all_traits();
        $data['categories'] = $this->Trait_model->get_trait_categories();
        $data['title'] = "Trait Compendium";

        $this->load->view('templates/header', $data);
        $this->load->view('templates/sidebar', $data);
        $this->load->view('traits/index', $data);
        $this->load->view('templates/footer', $data);
    }
}
