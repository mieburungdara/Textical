<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Armor_model extends CI_Model {

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /**
     * Get all armor items (equipment with armor-type equip slots).
     * @return array List of armor items with stats and slot info
     */
    public function get_all_armors() {
        $this->db->select('"ItemTemplate".*, "ItemEquipSlot"."slotKey"');
        $this->db->from('"ItemTemplate"');
        $this->db->join('"ItemEquipSlot"', '"ItemTemplate"."id" = "ItemEquipSlot"."itemId"', 'inner');
        $this->db->where('"ItemTemplate"."category"', 'EQUIPMENT');
        $this->db->where_in('"ItemEquipSlot"."slotKey"', array('HEAD', 'CHEST', 'LEGS', 'FEET', 'HANDS', 'OFF_HAND'));
        $this->db->where('"ItemTemplate"."weaponTypeId" IS NULL', NULL, FALSE);
        $this->db->order_by('"ItemTemplate"."rarity"', 'DESC');
        $this->db->order_by('"ItemTemplate"."name"', 'ASC');
        $query = $this->db->get();
        $items = $query->result_array();

        foreach ($items as &$item) {
            $item['stats'] = $this->get_item_stats($item['id']);
            $item['traits'] = $this->get_item_traits($item['id']);
        }

        return $items;
    }

    /**
     * Get stats for a specific item.
     * @param int $itemId Item template ID
     * @return array Associative array of statKey => statValue
     */
    private function get_item_stats($itemId) {
        $this->db->where('"itemId"', $itemId);
        $query = $this->db->get('"ItemStat"');
        $stats = $query->result_array();

        $result = array();
        foreach ($stats as $stat) {
            $result[$stat['statKey']] = (float)$stat['statValue'];
        }
        return $result;
    }

    /**
     * Get traits for a specific item.
     * @param int $itemId Item template ID
     * @return array List of trait objects
     */
    private function get_item_traits($itemId) {
        $this->db->select('"TraitTemplate"."id", "TraitTemplate"."name", "TraitTemplate"."description", "TraitTemplate"."category"');
        $this->db->from('"ItemTrait"');
        $this->db->join('"TraitTemplate"', '"ItemTrait"."traitId" = "TraitTemplate"."id"');
        $this->db->where('"ItemTrait"."itemId"', $itemId);
        $query = $this->db->get();
        return $query->result_array();
    }

    /**
     * Get armor slot categories for sidebar filtering.
     * @return array Associative array of slot categories
     */
    public function get_slot_categories() {
        $icons = array(
            'HEAD' => '🪖',
            'CHEST' => '🦺',
            'LEGS' => '👖',
            'FEET' => '👢',
            'HANDS' => '🧤',
            'OFF_HAND' => '🛡️'
        );

        $this->db->select('"ItemEquipSlot"."slotKey", COUNT(*) as count');
        $this->db->from('"ItemEquipSlot"');
        $this->db->join('"ItemTemplate"', '"ItemTemplate"."id" = "ItemEquipSlot"."itemId"');
        $this->db->where('"ItemTemplate"."category"', 'EQUIPMENT');
        $this->db->where('"ItemTemplate"."weaponTypeId" IS NULL', NULL, FALSE);
        $this->db->where_in('"ItemEquipSlot"."slotKey"', array('HEAD', 'CHEST', 'LEGS', 'FEET', 'HANDS', 'OFF_HAND'));
        $this->db->group_by('"ItemEquipSlot"."slotKey"');
        $query = $this->db->get();
        $rows = $query->result_array();

        $categories = array();
        foreach ($rows as $row) {
            $slot = $row['slotKey'];
            $categories[$slot] = array(
                'icon' => isset($icons[$slot]) ? $icons[$slot] : '📦',
                'count' => (int)$row['count']
            );
        }

        return $categories;
    }
}
