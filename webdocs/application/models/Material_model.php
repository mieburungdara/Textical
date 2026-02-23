<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Material_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get all materials from ItemTemplate where category = MATERIAL.
     * @return array List of material items with rarity info
     */
    public function get_all_materials() {
        $this->db->select('"ItemTemplate".*');
        $this->db->from('"ItemTemplate"');
        $this->db->where('"ItemTemplate"."category"', 'MATERIAL');
        $this->db->order_by('"ItemTemplate"."rarity"', 'DESC');
        $this->db->order_by('"ItemTemplate"."name"', 'ASC');
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get material sub-categories grouped with icons.
     * @return array Associative array of sub-categories
     */
    public function get_material_subcategories() {
        $icons = array(
            'ORE' => '⛏️',
            'WOOD' => '🪵',
            'CLOTH' => '🧵',
            'LEATHER' => '🦴',
            'HERB' => '🌿',
            'ESSENCE' => '💎',
            'FRAGMENT' => '🔮',
            'DUST' => '✨',
            'BONE' => '💀',
            'FOOD' => '🍖',
            'OTHER' => '📦'
        );

        // Since we don't have subCategory field yet, we derive from name patterns
        $materials = $this->get_all_materials();
        $categories = array();

        foreach ($materials as $m) {
            $sub = $this->_detect_subcategory($m['name']);
            if (!isset($categories[$sub])) {
                $categories[$sub] = array(
                    'icon' => isset($icons[$sub]) ? $icons[$sub] : '📦',
                    'count' => 0
                );
            }
            $categories[$sub]['count']++;
        }

        return $categories;
    }

    /**
     * Detect subcategory from material name patterns.
     * @param string $name Material name
     * @return string Detected subcategory
     */
    private function _detect_subcategory($name) {
        $lower = strtolower($name);

        if (strpos($lower, 'ore') !== false || strpos($lower, 'mithril') !== false 
            || strpos($lower, 'adamantite') !== false || strpos($lower, 'orichalcum') !== false
            || strpos($lower, 'mythril') !== false || strpos($lower, 'titanium') !== false) {
            return 'ORE';
        }
        if (strpos($lower, 'wood') !== false || strpos($lower, 'branch') !== false) return 'WOOD';
        if (strpos($lower, 'cloth') !== false || strpos($lower, 'silk') !== false 
            || strpos($lower, 'cotton') !== false || strpos($lower, 'wool') !== false) {
            return 'CLOTH';
        }
        if (strpos($lower, 'leather') !== false || strpos($lower, 'pelt') !== false 
            || strpos($lower, 'hide') !== false || strpos($lower, 'scale') !== false) {
            return 'LEATHER';
        }
        if (strpos($lower, 'leaf') !== false || strpos($lower, 'root') !== false 
            || strpos($lower, 'wort') !== false || strpos($lower, 'flower') !== false
            || strpos($lower, 'bane') !== false || strpos($lower, 'lotus') !== false
            || strpos($lower, 'thorn') !== false || strpos($lower, 'herb') !== false
            || strpos($lower, 'heart') !== false) {
            return 'HERB';
        }
        if (strpos($lower, 'essence') !== false || strpos($lower, 'fragment') !== false && strpos($lower, 'soul') !== false) return 'ESSENCE';
        if (strpos($lower, 'fragment') !== false || strpos($lower, 'relic') !== false 
            || strpos($lower, 'shard') !== false || strpos($lower, 'part') !== false) {
            return 'FRAGMENT';
        }
        if (strpos($lower, 'dust') !== false) return 'DUST';
        if (strpos($lower, 'bone') !== false) return 'BONE';
        if (strpos($lower, 'meat') !== false || strpos($lower, 'fish') !== false 
            || strpos($lower, 'vegetable') !== false || strpos($lower, 'grain') !== false
            || strpos($lower, 'fruit') !== false || strpos($lower, 'spice') !== false) {
            return 'FOOD';
        }
        return 'OTHER';
    }

    /**
     * Get subcategory for a single material.
     * @param string $name Material name
     * @return string Subcategory string
     */
    public function get_subcategory($name) {
        return $this->_detect_subcategory($name);
    }
}
