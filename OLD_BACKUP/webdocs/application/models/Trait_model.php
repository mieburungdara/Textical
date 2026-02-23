<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Trait_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get all trait templates.
     * @return array List of all traits
     */
    public function get_all_traits() {
        $this->db->order_by('"category"', 'ASC');
        $this->db->order_by('"name"', 'ASC');
        $query = $this->db->get('"TraitTemplate"');
        return $query->result_array();
    }

    /**
     * Get trait categories with icons and counts.
     * @return array Associative array of categories
     */
    public function get_trait_categories() {
        $icons = array(
            'OFFENSIVE' => '⚔️',
            'DEFENSIVE' => '🛡️',
            'MAGIC' => '🔮',
            'TACTICAL' => '🎯',
            'UTILITY' => '🔧',
            'GENERAL' => '📦'
        );

        $this->db->select('"category", COUNT(*) as count');
        $this->db->from('"TraitTemplate"');
        $this->db->group_by('"category"');
        $this->db->order_by('"category"', 'ASC');
        $query = $this->db->get();
        $rows = $query->result_array();

        $categories = array();
        foreach ($rows as $row) {
            $cat = $row['category'];
            $categories[$cat] = array(
                'icon' => isset($icons[$cat]) ? $icons[$cat] : '📦',
                'count' => (int)$row['count']
            );
        }

        return $categories;
    }

    /**
     * Get items that use a specific trait.
     * @param int $traitId Trait template ID
     * @return array List of items using this trait
     */
    public function get_trait_users($traitId) {
        $this->db->select('"ItemTemplate"."id", "ItemTemplate"."name", "ItemTemplate"."rarity"');
        $this->db->from('"ItemTrait"');
        $this->db->join('"ItemTemplate"', '"ItemTrait"."itemId" = "ItemTemplate"."id"');
        $this->db->where('"ItemTrait"."traitId"', $traitId);
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get heroes that have a specific trait.
     * @param int $traitId Trait template ID
     * @return array List of heroes
     */
    public function get_trait_heroes($traitId) {
        $this->db->select('"Hero"."id", "Hero"."name"');
        $this->db->from('"HeroTrait"');
        $this->db->join('"Hero"', '"HeroTrait"."heroId" = "Hero"."id"');
        $this->db->where('"HeroTrait"."traitId"', $traitId);
        $query = $this->db->get();
        return $query->result_array();
    }
}
