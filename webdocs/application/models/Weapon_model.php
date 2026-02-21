<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Weapon_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get all weapons with their relational weapon type and stats
     */
    public function get_all_weapons() {
        $this->db->select('ItemTemplate.*, WeaponType.name as weapon_type, WeaponType.category as parent_category');
        $this->db->from('ItemTemplate');
        $this->db->join('WeaponType', 'ItemTemplate.weaponTypeId = WeaponType.id', 'left');
        $this->db->where('ItemTemplate.category', 'EQUIPMENT');
        $query = $this->db->get();
        $items = $query->result_array();

        foreach ($items as &$item) {
            $item['stats'] = $this->get_item_stats($item['id']);
            $item['traits'] = $this->get_item_traits($item['id']);
            
            // If weapon_type is null from join, fallback to Other
            if (empty($item['weapon_type'])) {
                $item['weapon_type'] = 'Other';
                $item['type_details'] = array('passives' => array(), 'tags' => array());
            } else {
                $item['type_details'] = $this->get_weapon_type_details((int)$item['weaponTypeId']);
            }
        }

        return $items;
    }

    /**
     * Get traits for a specific item
     */
    private function get_item_traits($itemId) {
        $this->db->select('TraitTemplate.id, TraitTemplate.name, TraitTemplate.description');
        $this->db->from('ItemTrait');
        $this->db->join('TraitTemplate', 'ItemTrait.traitId = TraitTemplate.id');
        $this->db->where('ItemTrait.itemId', $itemId);
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get passives and tags for a weapon type
     */
    private function get_weapon_type_details($typeId) {
        // Passives
        $this->db->where('weaponTypeId', $typeId);
        $passives = $this->db->get('WeaponPassive')->result_array();

        // Tags
        $this->db->select('MechanicTag.name');
        $this->db->from('WeaponTypeTag');
        $this->db->join('MechanicTag', 'WeaponTypeTag.tagId = MechanicTag.id');
        $this->db->where('WeaponTypeTag.weaponTypeId', $typeId);
        $tags_raw = $this->db->get()->result_array();
        
        $tags = array();
        foreach ($tags_raw as $t) $tags[] = $t['name'];

        return array(
            'passives' => $passives,
            'tags' => $tags
        );
    }

    /**
     * Get stats for a specific item
     */
    private function get_item_stats($itemId) {
        $this->db->where('itemId', $itemId);
        $query = $this->db->get('ItemStat');
        $stats = $query->result_array();
        
        $result = array();
        foreach ($stats as $stat) {
            $result[$stat['statKey']] = (float)$stat['statValue'];
        }
        return $result;
    }

    /**
     * Get data formatted specifically for Game Export
     */
    public function get_export_data() {
        $weapons = $this->get_all_weapons();
        $export = array();

        foreach ($weapons as $w) {
            $export[] = array(
                'id' => (int)$w['id'],
                'name' => $w['name'],
                'description' => $w['description'],
                'rarity' => $w['rarity'],
                'category' => $w['category'],
                'baseValue' => (int)$w['baseValue'],
                'weapon_type' => $w['weapon_type'],
                'stats' => $w['stats']
            );
        }

        return $export;
    }

    /**
     * Get a full dump for Seeder PERSISTENCE
     */
    public function get_master_data() {
        // 1. Get all weapon types
        $types = $this->db->get('WeaponType')->result_array();
        
        // 2. Get all weapons
        $weapons = $this->get_all_weapons();
        
        return array(
            'types' => $types,
            'weapons' => $weapons
        );
    }

    /**
     * Get flat list of weapon types for select dropdown
     */
    public function get_all_types() {
        $query = $this->db->get('WeaponType');
        return $query->result_array();
    }

    /**
     * Update weapon data in both ItemTemplate and ItemStat
     */
    public function update_weapon($id, $data, $stats, $traitId = null) {
        $this->db->trans_start();

        // 1. Update main template
        $this->db->where('id', $id);
        $this->db->update('ItemTemplate', $data);

        // 2. Update stats
        foreach ($stats as $key => $value) {
            $this->db->where('itemId', $id);
            $this->db->where('statKey', $key);
            $this->db->update('ItemStat', array('statValue' => (float)$value));
            
            // If row doesn't exist (e.g. adding new stat), insert it
            if ($this->db->affected_rows() == 0) {
                // Check if it exists at all (affected_rows can be 0 if value is same)
                $exists = $this->db->where(array('itemId' => $id, 'statKey' => $key))->get('ItemStat')->num_rows();
                if (!$exists) {
                    $this->db->insert('ItemStat', array(
                        'itemId' => $id,
                        'statKey' => $key,
                        'statValue' => (float)$value
                    ));
                }
            }
        }

        // 3. Update trait
        $this->db->where('itemId', $id);
        $this->db->delete('ItemTrait');
        if ($traitId !== null && $traitId !== '' && $traitId != 0) {
            $this->db->insert('ItemTrait', array(
                'itemId' => $id,
                'traitId' => (int)$traitId
            ));
        }

        $this->db->trans_complete();
        return $this->db->trans_status();
    }

    /**
     * Get categorized weapon tree list from Database
     */
    public function get_weapon_categories() {
        // Main categories icons
        $icons = array(
            'MELEE' => '⚔️',
            'RANGED' => '🏹',
            'MAGIC' => '🔮',
            'SHIELD' => '🛡️',
            'UNARMED' => '👊'
        );

        $this->db->select('category, name');
        $this->db->from('WeaponType');
        $this->db->order_by('category', 'ASC');
        $this->db->order_by('name', 'ASC');
        $query = $this->db->get();
        $rows = $query->result_array();

        $tree = array();
        foreach ($rows as $row) {
            $cat = $row['category'];
            if (!isset($tree[$cat])) {
                $tree[$cat] = array(
                    'icon' => isset($icons[$cat]) ? $icons[$cat] : '📦',
                    'types' => array()
                );
            }
            $tree[$cat]['types'][] = $row['name'];
        }

        return $tree;
    }

    /**
     * Get all available traits for selection
     */
    public function get_all_traits() {
        $this->db->order_by('name', 'ASC');
        $query = $this->db->get('TraitTemplate');
        return $query->result_array();
    }
}
