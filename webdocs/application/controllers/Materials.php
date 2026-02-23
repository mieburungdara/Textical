<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Materials extends CI_Controller {

    public function __construct() {
        parent::__construct();
        $this->load->model('Material_model');
    }

    /**
     * Materials index page.
     */
    public function index() {
        $materials = $this->Material_model->get_all_materials();

        // Attach subcategory to each material
        foreach ($materials as &$m) {
            $m['subcategory'] = $this->Material_model->get_subcategory($m['name']);
        }

        $data['materials'] = $materials;
        $data['subcategories'] = $this->Material_model->get_material_subcategories();
        $data['title'] = "Material Database";

        $this->load->view('templates/header', $data);
        $this->load->view('templates/sidebar', $data);
        $this->load->view('materials/index', $data);
        $this->load->view('templates/footer', $data);
    }
}
